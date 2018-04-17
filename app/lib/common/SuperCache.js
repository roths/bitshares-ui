import ss from "common/localStorage";

const session = new ss("__gdex__user_");

class GdexCache {
    constructor() {}

    getUserInfo(user_account) {}

    cacheUserInfo(user_account, user_id, status) {}

    delUserInfo(user_account) {}

    getIndexForDepositKey(account_name, input_coin_type, output_coin_type) {}

    getCachedInputAddress(account_name, input_coin_type, output_coin_type) {}

    cacheInputAddress(
        account_name,
        input_coin_type,
        output_coin_type,
        address,
        memo
    ) {}

    clearInputAddress(account_name, input_coin_type, output_coin_type) {}
}

export default GdexCache;
