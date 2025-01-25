import { useState } from "react";

function useAsyncState<TYP, ERR, ARGS extends ReadonlyArray<unknown> >(
  initialValue: TYP,
  initialIsPending: boolean,
  initialError: ERR | null,
  asyncCallback: (...args: ARGS) => Promise<TYP>
): [TYP, boolean, ERR | null, (...args: ARGS) => Promise<void>] {
  const [isPending, setIsPending] = useState<boolean>(initialIsPending);
  const [value, setValue] = useState<TYP>(initialValue);
  const [error, setError] = useState<ERR | null>(initialError);

  const wrappedAsyncCallback = async (...args: ARGS): Promise<void> => {
    setIsPending(true);
    try {
      const result = await asyncCallback(...args);
      setValue(result);
      setError(null); // Reset the error on success
    } catch (e) {
      setError(e as ERR); // Type assertion for error
    } finally {
      setIsPending(false);
    }
  };

  return [value, isPending, error, wrappedAsyncCallback];
}

export default useAsyncState;
