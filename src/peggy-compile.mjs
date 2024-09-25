import fs from 'node:fs/promises';
import peggy from 'peggy';

export const esbuildPeggyPlugin = () => {
  return new class {
    name = 'peggy-loader';

    #convertLocation(text, range) {
      const {
        source,
        start: {
          line,
          column,
          offset,
        },
        end: {
          offset: endOffset,
        },
      } = range;
      const length = endOffset - offset;
      return {
        file:     source,
        line,
        column:   column - 1,
        length,
        lineText: text.split('\n', line).pop(),
      };
    }

    #generateMsgCollector(text, array) {
      const pluginName = this.name;
      return (
        stage,
        message,
        location,
        notes,
      ) => {
        const esbMessage = {
          pluginName,
          text:     `[${stage}] ${message}`,
          location: this.#convertLocation(text, location),
        };
        if (notes) {
          esbMessage.notes = notes.map(n => ({
            text:     n.message,
            location: this.#convertLocation(text, n.location),
          }));
        }
        array.push(esbMessage);
      };
    }

    setup = ({ initialOptions, onLoad }) => {
      initialOptions.loader ||= {};
      initialOptions.loader['.pegjs'] ||= 'file';

      onLoad({ filter: /\.pegjs$/, namespace: 'file' }, async ({ path }) => {
        const content = await fs.readFile(path, 'utf-8');

        const errors = [];
        const warnings = [];

        try {
          const parserSource = peggy.generate(content, {
            format:        'es',
            output:        'source',
            grammarSource: path,
            error:         this.#generateMsgCollector(content, errors),
            warning:       this.#generateMsgCollector(content, warnings),
          });

          return {
            contents: parserSource,
            warnings,
          };
        }
        catch {
          // errors have been collected in errors
        }

        return {
          errors,
          warnings,
        };
      });
    };
  }();
};

export const load = async (url, context, nextLoad) => {
  if (!url.match(/\.pegjs$/)) {
    return await nextLoad(url, context);
  }

  const loaded = await nextLoad(url, { ...context, format: 'module' });

  const parserSource = peggy.generate(loaded.source.toString(), {
    format:        'es',
    output:        'source',
    grammarSource: url,
  });

  return {
    format:       'module',
    shortCircuit: true,
    source:       parserSource,
  };
};
