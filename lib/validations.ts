export const validateRun = (run: string): boolean => {
    // Limpiamos el RUN de puntos y guión
    const cleanRun = run.replace(/[.-]/g, '');

    // Validar largo
    if (cleanRun.length < 8 || cleanRun.length > 9) return false;

    // Obtener dígito verificador
    const dv = cleanRun.slice(-1).toLowerCase();
    const rutNumber = parseInt(cleanRun.slice(0, -1));

    if (isNaN(rutNumber)) return false;

    // Calcular dígito verificador
    let sum = 0;
    let multiplier = 2;

    // Convertimos a string para iterar y luego a number para calcular
    const rutDigits = rutNumber.toString().split('').reverse();

    for (const digit of rutDigits) {
        sum += parseInt(digit) * multiplier;
        multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }

    const expectedDv = 11 - (sum % 11);
    const calculatedDv =    expectedDv === 11 ? '0' :
                            expectedDv === 10 ? 'k' :
                            expectedDv.toString();

    return dv === calculatedDv;
};

export const formatRun = (run: string): string => {
    const cleanRun = run.replace(/[.-]/g, '');
    const number = cleanRun.slice(0, -1);
    const dv = cleanRun.slice(-1);

    // Formatea con puntos cada 3 dígitos
    const formatted = number.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${formatted}-${dv}`;
};
