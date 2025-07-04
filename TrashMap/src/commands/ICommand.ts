/**
 * Command pattern interface for TrashMap MVP
 * Provides a common interface for all command implementations
 */

export interface ICommand<T = any> {
  /**
   * Execute the command
   * @returns Promise that resolves with command result
   */
  execute(): Promise<T>;

  /**
   * Undo the command if possible
   * Optional method for commands that support undo operations
   */
  undo?(): Promise<void>;

  /**
   * Get command description for logging/debugging
   */
  getDescription(): string;
}
