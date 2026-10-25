export function phoneError(value: string) {
 const phone = value.trim();
 if (!phone) return 'Укажите номер телефона.';
 if (!/^\+?[\d\s().-]+$/.test(phone)) return 'Используйте цифры, пробелы, скобки и дефисы. Плюс допустим только в начале.';
 const digits = phone.replace(/\D/g, '');
 if (digits.length < 10) return 'Номер слишком короткий: введите не менее 10 цифр.';
 if (digits.length > 15) return 'Номер слишком длинный: допустимо не более 15 цифр.';
 if (/^(\d)\1+$/.test(digits)) return 'Проверьте номер: он не может состоять из одной повторяющейся цифры.';
 return '';
}
