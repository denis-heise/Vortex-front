const inputsPhone = document.querySelectorAll('input[type=tel], input[name=tel], input[name=phone]');

const formatPhone = numbers => {
    numbers = numbers.replace(/\D/g, '').slice(0, 11);

    if (numbers.startsWith('8')) numbers = '7' + numbers.slice(1);
    if (!numbers.startsWith('7')) numbers = '7' + numbers;

    let result = '+7';
    if (numbers.length > 1) result += ' (' + numbers.substring(1, 4);
    if (numbers.length >= 5) result += ') ' + numbers.substring(4, 7);
    if (numbers.length >= 8) result += '-' + numbers.substring(7, 9);
    if (numbers.length >= 10) result += '-' + numbers.substring(9, 11);

    return result;
};

const onPhoneInput = e => {
    const input = e.target;
    const numbers = input.value.replace(/\D/g, '');
    input.value = numbers ? formatPhone(numbers) : '';
};

const onPhonePaste = e => {
    const input = e.target;

    setTimeout(() => {
        const numbers = input.value.replace(/\D/g, '');
        input.value = numbers ? formatPhone(numbers) : '';
    }, 0);
};

const onPhoneKeyDown = e => {
    const allowedKeys = [8, 9, 37, 38, 39, 40, 46];
    if (e.ctrlKey || e.metaKey) return;
    if (allowedKeys.includes(e.keyCode)) return;
    if ((e.keyCode < 48 || e.keyCode > 57) && (e.keyCode < 96 || e.keyCode > 105)) e.preventDefault();
};

inputsPhone.forEach(input => {
    input.addEventListener('keydown', onPhoneKeyDown);
    input.addEventListener('input', onPhoneInput);
    input.addEventListener('paste', onPhonePaste);
});
