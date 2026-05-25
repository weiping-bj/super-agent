/**
 * Stream Registry
 * Manages active SSE streams so that clients can reconnect to in-progress sessions.
 * Each generating session publishes events here; new subscribers get buffered events
 * plus live events going forward.
 */

import { EventEmitter } from 'events';
import type { ConversationEvent } from './claude-agent.service.js';

interface ActiveStream {
  /** All events emitted so far (for replay on reconnect) */
  buffer: ConversationEvent[];
  /** Whether the stream has completed */
  done: boolean;
  /** EventEmitter for live subscribers */
  emitter: EventEmitter;
}

class StreamRegistry {
  private streams = new Map<string, ActiveStream>();
  /** Persistent session-level emitters for long-lived subscribers (e.g. WebUI watching a session). */
  private sessionEmitters = new Map<string, EventEmitter>();

  /**
   * Register a new active stream for a session.
   */
  register(sessionId: string): void {
    this.streams.set(sessionId, {
      buffer: [],
      done: false,
      emitter: new EventEmitter(),
    });
  }

  /**
   * Push an event to the stream buffer and notify subscribers.
   * Also emits on the persistent session emitter for long-lived subscribers.
   */
  push(sessionId: string, event: ConversationEvent): void {
    const stream = this.streams.get(sessionId);
    if (stream) {
      stream.buffer.push(event);
      stream.emitter.emit('event', event);
    }
    // Notify persistent subscribers regardless of whether a stream is registered
    const sessionEmitter = this.sessionEmitters.get(sessionId);
    if (sessionEmitter) {
      sessionEmitter.emit('event', event);
    }
  }

  /**
   * Mark the stream as done and notify subscribers.
   */
  complete(sessionId: string): void {
    const stream = this.streams.get(sessionId);
    if (!stream) return;
    stream.done = true;
    stream.emitter.emit('done');
    // Notify persistent subscribers that this generation round is done
    const sessionEmitter = this.sessionEmitters.get(sessionId);
    if (sessionEmitter) {
      sessionEmitter.emit('done');
    }
    // Clean up after a delay to allow late reconnects
    setTimeout(() => {
      this.streams.delete(sessionId);
    }, 30_000);
  }

  /**
   * Check if a session has an active (not yet done) stream.
   */
  isActive(sessionId: string): boolean {
    const stream = this.streams.get(sessionId);
    return !!stream && !stream.done;
  }

  /**
   * Subscribe to a session's stream. Returns the buffered events so far
   * and an emitter for live events. Returns null if no active stream.
   */
  subscribe(sessionId: string): {
    buffer: ConversationEvent[];
    emitter: EventEmitter;
    done: boolean;
  } | null {
    const stream = this.streams.get(sessionId);
    if (!stream) return null;
    return {
      buffer: [...stream.buffer],
      emitter: stream.emitter,
      done: stream.done,
    };
  }

  /**
   * Get or create a persistent emitter for a session.
   * Used by long-lived subscribers (WebUI watching a session for external events).
   * The emitter stays alive across multiple generation rounds.
   */
  getSessionEmitter(sessionId: string): EventEmitter {
    let emitter = this.sessionEmitters.get(sessionId);
    if (!emitter) {
      emitter = new EventEmitter();
      this.sessionEmitters.set(sessionId, emitter);
    }
    return emitter;
  }

  /**
   * Remove persistent emitter when no more listeners.
   */
  cleanupSessionEmitter(sessionId: string): void {
    const emitter = this.sessionEmitters.get(sessionId);
    if (emitter && emitter.listenerCount('event') === 0) {
      this.sessionEmitters.delete(sessionId);
    }
  }
}

export const streamRegistry = new StreamRegistry();
