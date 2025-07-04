import eventBus from '../src/events/EventBus';

describe('EventBus singleton', () => {
  beforeEach(() => {
    // Remove all listeners between tests to avoid cross-test pollution
    eventBus.removeAllListeners();
  });

  it('should call subscribed listener when event is emitted', () => {
    const listener = jest.fn();
    eventBus.subscribe<number>('TEST_EVENT', listener);

    const payload = 42;
    const emitted = eventBus.emitEvent<number>('TEST_EVENT', payload);

    expect(emitted).toBe(true);                  // emit() returned true (had at least one listener)
    expect(listener).toHaveBeenCalledTimes(1);   // listener was called once
    expect(listener).toHaveBeenCalledWith(payload);
  });

  it('should not call listener after unsubscribe', () => {
    const listener = jest.fn();
    eventBus.subscribe<string>('TEST_EVENT', listener);
    eventBus.unsubscribe('TEST_EVENT', listener);

    const emitted = eventBus.emitEvent<string>('TEST_EVENT', 'hello');
    expect(emitted).toBe(false);                 // no listeners left
    expect(listener).not.toHaveBeenCalled();
  });

  it('subscribeOnce should only fire listener once', () => {
    const listener = jest.fn();
    eventBus.subscribeOnce<object>('ONCE_EVENT', listener);

    eventBus.emitEvent('ONCE_EVENT', { a: 1 });
    eventBus.emitEvent('ONCE_EVENT', { a: 2 });

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith({ a: 1 });
  });

  it('multiple subscribers should all be notified', () => {
    const l1 = jest.fn();
    const l2 = jest.fn();
    eventBus.subscribe('MULTI', l1);
    eventBus.subscribe('MULTI', l2);

    eventBus.emitEvent('MULTI', 'data');

    expect(l1).toHaveBeenCalledWith('data');
    expect(l2).toHaveBeenCalledWith('data');
  });
});
