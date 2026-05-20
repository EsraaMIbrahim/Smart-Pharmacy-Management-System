// This custom hook provides a function to trigger the browser's print dialog.

export function usePrint() {
  const handlePrint = () => {
    window.print();
  };

  return { handlePrint };
}
