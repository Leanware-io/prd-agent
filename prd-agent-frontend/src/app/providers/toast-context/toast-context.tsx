import {
  createContext,
  PropsWithChildren,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { type ToastActionElement, Toaster, type ToastProps } from "@/shared/ui";
import { v4 as uuidV4 } from "uuid";

const TOAST_LIMIT = 1;

const TOAST_REMOVE_DELAY = 5000;

export type ToasterToast = ToastProps & {
  action?: ToastActionElement;
  description?: ReactNode;
  id: string;
  title?: ReactNode;
};

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
} as const;

type ActionType = typeof actionTypes;

type Action =
  | {
      toast: ToasterToast;
      type: ActionType["ADD_TOAST"];
    }
  | {
      toast: Partial<ToasterToast>;
      type: ActionType["UPDATE_TOAST"];
    }
  | {
      toastId?: ToasterToast["id"];
      type: ActionType["DISMISS_TOAST"];
    }
  | {
      toastId?: ToasterToast["id"];
      type: ActionType["REMOVE_TOAST"];
    };

interface State {
  toasts: ToasterToast[];
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return;
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({ toastId, type: "REMOVE_TOAST" });
  }, TOAST_REMOVE_DELAY);

  toastTimeouts.set(toastId, timeout);
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t,
        ),
      };

    case "DISMISS_TOAST": {
      const { toastId } = action;

      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id);
        });
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t,
        ),
      };
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };
  }
};

type Toast = Omit<ToasterToast, "id">;

interface ToastContextValue {
  dismiss: (toastId?: string) => void;
  toast: (props: Toast) => {
    dismiss: () => void;
    id: string;
    update: (props: ToasterToast) => void;
  };
  toasts: ToasterToast[];
}

const ToastContext = createContext<ToastContextValue>({
  dismiss: () => {},
  toast: () => ({
    dismiss: () => {},
    id: "",
    update: () => {},
  }),
  toasts: [],
});

let memoryState: State = { toasts: [] };

const listeners: Array<(state: State) => void> = [];

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

interface IToastProvider extends PropsWithChildren {}

export const ToastProvider = (props: Readonly<IToastProvider>) => {
  const { children } = props;

  const [state, setState] = useState<State>(memoryState);

  useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);

  const toast = useCallback((props: Toast) => {
    const id = uuidV4();

    const update = (props: ToasterToast) =>
      dispatch({
        toast: { ...props, id },
        type: "UPDATE_TOAST",
      });
    const dismiss = () => dispatch({ toastId: id, type: "DISMISS_TOAST" });

    dispatch({
      toast: {
        ...props,
        id,
        onOpenChange: (open: boolean) => {
          if (!open) {
            dismiss();
          }
        },
        open: true,
      },
      type: "ADD_TOAST",
    });

    setTimeout(() => {
      dismiss();
    }, TOAST_REMOVE_DELAY);

    return { dismiss, id, update };
  }, []);

  const dismiss = useCallback(
    (toastId?: string) => dispatch({ toastId, type: "DISMISS_TOAST" }),
    [],
  );

  const value = useMemo(
    () => ({
      dismiss,
      toast,
      toasts: state.toasts,
    }),
    [dismiss, toast, state.toasts],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toaster />
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
