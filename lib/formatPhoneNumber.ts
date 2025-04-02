export const formatPhoneNumber = (phone: string) => {
    // Si el teléfono tiene 8 dígitos, lo formateamos
    if (phone.length === 8) {
        return `${phone.slice(0, 4)} - ${phone.slice(4)}`;
    }
    // Si no, devolvemos el número sin cambios
    return phone;
};
