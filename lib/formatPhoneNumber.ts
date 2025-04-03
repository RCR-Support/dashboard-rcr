export const formatPhoneNumber = (phone: string): string => {
    // Limpiamos el número de cualquier formato previo
    const cleanNumber = phone.replace(/\D/g, '');

    // Validamos que tenga 9 dígitos
    if (cleanNumber.length !== 9) {
        return phone; // Retornamos el número original si no cumple
    }

    // Obtenemos el primer dígito para determinar el tipo de número
    const firstDigit = cleanNumber.charAt(0);

    switch (firstDigit) {
        case '9':
            // Celular: +56 9 xxxx-xxxx
            return `+56 9 ${cleanNumber.slice(1, 5)} - ${cleanNumber.slice(5)}`;
        case '2':
            // Teléfono fijo Santiago: +56 2 xxxx-xxxx
            return `+56 2 ${cleanNumber.slice(1, 5)} - ${cleanNumber.slice(5)}`;
        default:
            // Teléfono fijo regiones: +56 xx xxx-xxxx
            return `+56 ${cleanNumber.slice(0, 2)} ${cleanNumber.slice(2, 5)} - ${cleanNumber.slice(5)}`;
    }
};
