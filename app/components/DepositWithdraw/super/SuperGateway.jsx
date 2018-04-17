import React from "react";
import {fetchAssets, fetchUserInfo, registerUser} from "common/superMethods";
import SuperCache from "common/SuperCache";
import LoadingIndicator from "../../LoadingIndicator";
import Translate from "react-translate-component";
import SuperGatewayInfo from "./SuperGatewayInfo";
import {connect} from "alt-react";
import SettingsStore from "stores/SettingsStore";
import SettingsActions from "actions/SettingsActions";
import SuperHistory from "./SuperHistory";
import SuperAgreementModal from "./SuperAgreementModal";
import BaseModal from "../../Modal/BaseModal";
import ZfApi from "react-foundation-apps/src/utils/foundation-api";

class SuperGateway extends React.Component {
    constructor(props) {
        super();
        const action = props.viewSettings.get(
            `${props.provider}Action`,
            "deposit"
        );

        this.state = {
            coins: null,
            activeCoinInfo: this._getActiveCoinInfo(props, {action}),
            action,
            down: false,
            isAvailable: true,
            user_info: null,
            isAgree: false,
            agreeChecked: true,
            agreeNotice: false,
            locale: props.viewSettings.get("locale")
        };
        this.user_info_cache = new SuperCache();
    }

    _getActiveCoinInfo(props, state) {
        let cachedCoinName = props.viewSettings.get(
            `activeCoin_${props.provider}_${state.action}`,
            null
        );
        let cachedCoinId = props.viewSettings.get(
            `activeCoinId_${props.provider}`,
            null
        );
        return {
            name:
                cachedCoinName || state.action == "deposit"
                    ? "ETH"
                    : "SLBITS.ETH",
            id: cachedCoinId || 3777
        };
    }

    _getUserInfo(userName = null) {
        if (!userName) userName = this.props.account.get("name");

        var result = fetchUserInfo({account: userName});
        let _this = this;
        result.then(function(res) {
            _this.setState({
                isAgree: res.isAgree,
                user_info: res
            });
        });

        result.catch(err => {
            _this.setState({isAvailable: false});
            console.log("Exception in fetching user info: " + err);
        });
    }

    _getCoins() {
        var result = fetchAssets({userAccount: this.props.account.get("name")});

        result.then(
            data => {
                let trans_data = this._transformCoin(data);
                this.setState({isAvailable: true, coins: trans_data});
            },
            errMsg => {
                console.log("fail" + errMsg);
            }
        );
        result.catch(err => {
            console.log(err);
            this.setState({isAvailable: false});
        });
    }

    _transformCoin(data) {
        var result = [];
        try {
            let assetType = this.state.action == "deposit" ? 2 : 1;
            data
                .filter(coin => {
                    return (
                        (assetType == 2 && coin.depositAllowed) ||
                        (assetType == 1 && coin.withdrawalAllowed)
                    );
                })
                .forEach(coin => {
                    coin.outerSymbol = coin.symbol;
                    coin.innerSymbol = "SLBITS." + coin.symbol;
                    coin.needMemo = false;
                    coin.minTransactionAmount =
                        assetType == 2
                            ? coin.min_deposit_amount
                            : coin.min_withdrawal_amount;
                    result.push(coin);
                });
        } catch (err) {
            console.log("Transform coin failed: ", err);
        }
        return result;
    }

    componentWillMount() {
        this._getUserInfo();
        this._getCoins();
    }

    _getWithdrawAssetId(assetName) {
        let assetSymbol = "innerSymbol";
        if (this.state.action == "deposit") {
            assetSymbol = "outerSymbol";
        }
        let assetId = this.state.coins.filter(coin => {
            return coin[assetSymbol] == assetName;
        })[0].assetId;
        return assetId;
    }

    onSelectCoin(e) {
        let activeCoinInfo = this.state.activeCoinInfo;
        activeCoinInfo.name = e.target.value;
        let assetId = this._getWithdrawAssetId(e.target.value);
        activeCoinInfo.id = assetId;
        this.setState({
            activeCoinInfo: activeCoinInfo
        });
        this._saveCoin(e.target.value, assetId);
    }

    _saveCoin(name, id) {
        let setting = {};
        setting[
            `activeCoin_${this.props.provider}_${this.state.action}`
        ] = name;
        setting[`activeCoinId_${this.props.provider}`] = id;
        SettingsActions.changeViewSetting(setting);
    }

    changeAction(type) {
        let activeCoinInfo = this._getActiveCoinInfo(this.props, {
            action: type
        });
        this.setState({
            action: type,
            activeCoinInfo: activeCoinInfo
        });
        SettingsActions.changeViewSetting({
            [`${this.props.provider}Action`]: type
        });
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.account != nextProps.account) {
            this._getUserInfo(nextProps.account.get("name"));
        }
    }

    _updateCheck() {
        this.setState({agreeChecked: !this.state.agreeChecked});
        this.setState({agreeNotice: false});
    }

    _showUserAgreement() {
        ZfApi.publish("Super_agreement", "open");
    }

    _registerUser() {
        if (this.state.agreeChecked) {
            var result = registerUser({
                account: this.props.account.get("name")
            });
            let _this = this;
            result.then(function() {
                _this._getUserInfo();
            });

            result.catch(err => {
                _this.setState({isAvailable: false});
                console.log("Exception in register user info: " + err);
            });
        } else {
            this.setState({agreeNotice: true});
        }
    }

    render() {
        let {account} = this.props;
        let {
            coins,
            activeCoinInfo,
            action,
            isAvailable,
            user_info,
            isAgree,
            agreeChecked,
            agreeNotice
        } = this.state;

        let issuer = {
            ticket: "https://support.Super.io/",
            qq: "602573197",
            telgram: "https://t.me/Superer"
        };
        let supportContent = (
            <div>
                {/*<label className="left-label">Support</label>*/}
                <br />
                <br />
                <Translate content="gateway.support_gdex" />
                <br />
                <br />
                <p>
                    Help:{" "}
                    <a
                        href={issuer.ticket}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {issuer.ticket}
                    </a>
                </p>
                <p>
                    QQ:{" "}
                    <a
                        target="_blank"
                        href="//shang.qq.com/wpa/qunwpa?idkey=5d192c325146762cf5a9256038fed9faef4fcace21a36882854354dd1d599f11"
                        rel="noopener noreferrer"
                    >
                        {issuer.qq}
                    </a>
                </p>
                <p>
                    Telegram:{" "}
                    <a
                        href={issuer.telgram}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {issuer.telgram}
                    </a>
                </p>
            </div>
        );
        if (!isAgree) {
            return (
                <div>
                    <span>
                        <input
                            type="checkbox"
                            style={{marginRight: "10px"}}
                            checked={agreeChecked}
                            onChange={this._updateCheck.bind(this)}
                        />
                        <Translate
                            className="txtlabel"
                            content="gateway.agreement.hint"
                        />
                        <a onClick={this._showUserAgreement.bind(this)}>
                            {" "}
                            <Translate
                                className="txtlabel"
                                content="gateway.agreement.name"
                            />
                        </a>
                    </span>
                    {agreeNotice ? (
                        <div className="has-error" style={{paddingTop: 10}}>
                            <Translate
                                className="txtlabel"
                                content="gateway.agreement.notice"
                            />
                        </div>
                    ) : null}

                    <div className="buttonGroup">
                        <span
                            style={{marginTop: "20px"}}
                            onClick={this._registerUser.bind(this)}
                            className=" button"
                        >
                            <Translate
                                className="txtlabel"
                                content="gateway.agreement.register"
                            />
                        </span>
                    </div>
                    <BaseModal id={"Super_agreement"} overlay={true}>
                        <br />
                        <div className="grid-block vertical">
                            <SuperAgreementModal
                                locale={this.props.settings.get("locale", "en")}
                            />
                        </div>
                    </BaseModal>
                    {supportContent}
                </div>
            );
        }
        if (!coins && isAvailable) {
            return <LoadingIndicator />;
        }
        if (!isAvailable) {
            return (
                <div>
                    <Translate
                        className="txtlabel cancel"
                        content="gateway.unavailable"
                        component="h4"
                    />
                </div>
            );
        }

        let assetSymbol = null;
        let assetId = null;
        let actionType = null;
        if (action == "deposit") {
            assetId = "outerAssetId";
            assetSymbol = "outerSymbol";
            actionType = 2;
        } else {
            assetId = "innerAssetId";
            assetSymbol = "innerSymbol";
            actionType = 1;
        }
        coins = coins.filter(coin => {
            return (
                (actionType == 2 && coin.depositAllowed) ||
                (actionType == 1 && coin.withdrawalAllowed)
            );
        });
        let coinOptions = coins
            .map(coin => {
                return (
                    <option value={coin[assetSymbol]} key={coin[assetSymbol]}>
                        {coin[assetSymbol]}
                    </option>
                );
            })
            .filter(a => {
                return a !== null;
            });

        let coin = coins.filter(coin => {
            return coin[assetSymbol] == activeCoinInfo.name;
        })[0];

        let infos = null;
        if (!coin) {
            infos = (
                <label className="left-label">
                    <Translate
                        className="txtlabel cancel"
                        content="gateway.asset_unavailable"
                        asset={activeCoinInfo.name}
                        component="h4"
                    />
                </label>
            );
        } else if (!user_info) {
            infos = (
                <label className="left-label">
                    <Translate
                        className="txtlabel cancel"
                        content="gateway.user_unavailable"
                        component="h4"
                    />
                </label>
            );
        } else if (user_info.status != 0) {
            infos = (
                <label className="left-label">
                    <Translate
                        className="txtlabel cancel"
                        content="gateway.frozen"
                        account={account.get("name")}
                        component="h4"
                    />
                </label>
            );
        }

        return (
            <div style={this.props.style}>
                <div className="grid-block no-margin vertical medium-horizontal no-padding">
                    <div className="medium-4">
                        <div>
                            <label
                                style={{minHeight: "2rem"}}
                                className="left-label"
                            >
                                <Translate
                                    content={"gateway.choose_" + action}
                                />:{" "}
                            </label>
                            <select
                                className="external-coin-types bts-select"
                                onChange={this.onSelectCoin.bind(this)}
                                value={activeCoinInfo.name}
                            >
                                {coinOptions}
                            </select>
                        </div>
                    </div>

                    <div className="medium-6 medium-offset-1">
                        <label
                            style={{minHeight: "2rem"}}
                            className="left-label"
                        >
                            <Translate content="gateway.gateway_text" />:
                        </label>
                        <div style={{paddingBottom: 15}}>
                            <ul className="button-group segmented no-margin">
                                <li
                                    className={
                                        action === "deposit" ? "is-active" : ""
                                    }
                                >
                                    <a
                                        onClick={this.changeAction.bind(
                                            this,
                                            "deposit"
                                        )}
                                    >
                                        <Translate content="gateway.deposit" />
                                    </a>
                                </li>
                                <li
                                    className={
                                        action === "withdraw" ? "is-active" : ""
                                    }
                                >
                                    <a
                                        onClick={this.changeAction.bind(
                                            this,
                                            "withdraw"
                                        )}
                                    >
                                        <Translate content="gateway.withdraw" />
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                {infos ? (
                    infos
                ) : (
                    <div>
                        <div style={{marginBottom: 15}}>
                            <SuperGatewayInfo
                                account={account}
                                coin={coin}
                                issuer_account={coin.intermediate}
                                user_id={account.get("id")}
                                action={this.state.action}
                                gateway={"Super"}
                            />
                        </div>
                        <SuperHistory
                            userId={parseInt(account.get("id").split(".")[2])}
                            userAccount={account.get("name")}
                            asset={"1.3." + coin.id}
                            assetId={coin.id}
                            assetName={coin[assetSymbol]}
                            compactView={true}
                            fullHeight={true}
                            recordType={action == "deposit" ? 1 : 2}
                            filter="transfer"
                            title={
                                <Translate
                                    content={
                                        "gateway.recent_" + this.state.action
                                    }
                                />
                            }
                        />
                    </div>
                )}

                {supportContent}
            </div>
        );
    }
}

export default connect(SuperGateway, {
    listenTo() {
        return [SettingsStore];
    },
    getProps() {
        return {
            viewSettings: SettingsStore.getState().viewSettings,
            settings: SettingsStore.getState().settings
        };
    }
});
