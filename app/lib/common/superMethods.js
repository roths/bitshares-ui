
export function validateAddress() {
	return true;
}

function hasWithdrawalAddress() {
	return true;
}
function setWithdrawalAddresses() {
}
function getWithdrawalAddresses() {
	return ["quicksnake-1"];
}
function setLastWithdrawalAddress() {
}
function getLastWithdrawalAddress() {
	return "quicksnake-1";
}

export const WithdrawAddresses = {
    has: hasWithdrawalAddress,
    set: setWithdrawalAddresses,
    get: getWithdrawalAddresses,
    setLast: setLastWithdrawalAddress,
    getLast: getLastWithdrawalAddress
};