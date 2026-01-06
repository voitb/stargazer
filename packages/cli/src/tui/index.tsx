import { render } from 'ink';
import { App } from './app.js';

export async function startTUI(): Promise<void> {
  const projectPath = process.cwd();

  let instance;
  try {
    instance = render(<App projectPath={projectPath} />);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to initialize TUI: ${msg}. Try running with --no-tui flag.`);
  }

  try {
    await instance.waitUntilExit();
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    throw new Error(`TUI crashed unexpectedly: ${msg}`);
  }
}
