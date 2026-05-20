export function useMedicineTable(med, getSmartDiscount) {
  const isLow = med.stock < 10;

  const isExpiringSoon =
    med.expiry <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) &&
    med.expiry >= new Date();

  const discount = getSmartDiscount(med.expiry);

  return {
    isLow,
    isExpiringSoon,
    discount,
  };
}
