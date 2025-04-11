import { fromEvent, merge } from "rxjs";
import { map, filter, scan, tap } from "rxjs/operators";

interface State {
  counter: number;
  type: EventType;
  offset_start: [number, number];
  client_start: [number, number];
  client_end: [number, number];
  wheel: number;
}
type FN = (state: State) => State;

export enum EventType {
  MOUSE_DOWN = "mousedown",
  MOUSE_MOVE = "mousemove",
  MOUSE_UP = "mouseup",
  WHEEL = "wheel",
}
export const mousemove$ = fromEvent<MouseEvent>(window, "mousemove");
export const mouseup$ = fromEvent<MouseEvent>(window, "mouseup");
export function fromElement(target: HTMLElement) {
  return merge(
    fromEvent<MouseEvent>(target, "mousedown").pipe(
      tap((ev) => {
        ev.stopPropagation();
        ev.preventDefault();
      }),
      filter(({ button }) => button === 0),
      map(
        ({ clientX, clientY }): FN =>
          (state) => {
            const rect = target.getBoundingClientRect();
            const offsetX = clientX - rect.left;
            const offsetY = clientY - rect.top;
            return {
              ...state,
              counter: 1,
              type: EventType.MOUSE_DOWN,
              offset_start: [offsetX, offsetY],
              client_start: [clientX, clientY],
              client_end: [clientX, clientY],
            };
          }
      )
    ),
    mousemove$.pipe(
      map<MouseEvent, FN>(({ clientX, clientY }) => (state) => ({
        ...state,
        counter: state.counter === 1 ? 1 : -1,
        type: EventType.MOUSE_MOVE,
        client_end: [clientX, clientY],
      }))
    ),
    mouseup$.pipe(
      filter(({ button }) => button === 0),
      map<MouseEvent, FN>(({ clientX, clientY }) => (state) => ({
        ...state,
        counter: state.counter === 1 ? 0 : -1,
        type: EventType.MOUSE_UP,
        client_end: [clientX, clientY],
      }))
    ),
    fromEvent<WheelEvent>(target, "wheel").pipe(
      tap((ev) => {
        ev.stopPropagation();
        ev.preventDefault();
      }),
      map<WheelEvent, FN>(({ deltaY }) => (state) => ({
        ...state,
        counter: 2,
        type: EventType.WHEEL,
        wheel: deltaY,
      }))
    )
  ).pipe(
    scan<FN, State>((state, fn) => fn(state), {
      counter: -1,
      type: EventType.MOUSE_MOVE,
      offset_start: [0, 0],
      client_start: [0, 0],
      client_end: [0, 0],
      wheel: 0,
    }),
    filter((data) => data.counter >= 0),
    map(({ type, offset_start, client_start, client_end, wheel }) => ({
      type,
      point: {
        x: offset_start[0],
        y: offset_start[1],
      },
      offset: {
        x: client_end[0] - client_start[0],
        y: client_end[1] - client_start[1],
      },
      wheel,
    }))
  );
}
