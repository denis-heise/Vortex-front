const formatCurrency = (num) => {
	if (num === 0 || isNaN(num)) return '—';
	return '$' + num.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$& ').replace('.', ',');
};

const parsePrice = (text) => {
	if (!text || text === '—') return 0;
	return parseFloat(text.replace(/[^0-9.,]/g, '').replace(',', '.')) || 0;
};

const getPositionsWord = (count) => {
	const lastDigit = count % 10;
	const lastTwoDigits = count % 100;
	if (lastTwoDigits >= 11 && lastTwoDigits <= 19) return 'позиций';
	if (lastDigit === 1) return 'позиция';
	if (lastDigit >= 2 && lastDigit <= 4) return 'позиции';
	return 'позиций';
};

const formatBasketNumber = (number) => {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(number);
};
