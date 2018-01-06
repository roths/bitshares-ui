import React from "react";
import LoadingIndicator from "../../LoadingIndicator";
import Translate from "react-translate-component";
import SuperGatewayInfo from "./SuperGatewayInfo";
import { connect } from "alt-react";
import SettingsStore from "stores/SettingsStore";
import SettingsActions from "actions/SettingsActions";
import SuperCache from "../../../lib/common/SuperCache";
import SuperHistory from "./SuperHistory";
import SuperAgreementModal from "./SuperAgreementModal";
import BaseModal from "../../Modal/BaseModal";
import ZfApi from "react-foundation-apps/src/utils/foundation-api";
var NodeRSA = require('node-rsa');
let gdexPublicKey=new NodeRSA('-----BEGIN PUBLIC KEY-----\n'+
    'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCH+QtHPKcWxdL25xL4pCuu16tKh6yPx/TFnd/8\n'+
    'cSt2TC+sPuYsD0h/sy4VKNxhBb7F7U/TLXjMxNcSfPVPjPM3X2LvOlmU9LOEcJGrmlmOOiyO/kws\n'+
    'yKKOhR4UyZ1NghhfHjuyDBj6V8fCL+xBZTJWsh/X61Z0wLCwOzXcQCsNJwIDAQAB\n'+
    '-----END PUBLIC KEY-----');

class SuperGateway extends React.Component {

    constructor(props) {
        super();
        const action = props.viewSettings.get(`${props.provider}Action`, "deposit");

        this.state = {
            coins:null,
            activeCoinInfo: this._getActiveCoinInfo(props, {action}),
            action,
            isAvailable:true,
            user_info:null,
            isAgree:false,
            agreeChecked:true,
            agreeNotice:false,
            locale:props.viewSettings.get("locale")
        };
        this.user_info_cache = new SuperCache();
    }


    _getActiveCoinInfo(props, state) {
        let cachedCoinName = props.viewSettings.get(`activeCoin_${props.provider}_${state.action}`, null);
        let cachedCoinId = props.viewSettings.get(`activeCoinId_${props.provider}`, null);
        let firstTimeCoinName = "";
        let firstTimeCoinId = 0;
        let activeCoinName = cachedCoinName ? cachedCoinName : firstTimeCoinName;
        let activeCoinId = cachedCoinId ? cachedCoinId : firstTimeCoinId;

        // default selected first item
        let {action, coins} = state;
        if (coins) {
            let actionType = action == "deposit" ? 2 : 1;
            let activeCoinInfo = coins.filter((coin) => coin.type == actionType)
                .map((coin) => {return {name : coin.innerSymbol, assetId : coin.innerAssetId}})[0];
            if (activeCoinInfo) return activeCoinInfo;
        }
        return {"name":activeCoinName, "id": activeCoinId};
    }


    _getCoins(){
        let _this = this;
        let trans_data = [
            {
                // 用户给承兑商的资产
                innerAssetId : "1.3.113",
                innerAssetName : "BITCNY",
                innerSymbol: "CNY",
                // 承兑商给用户的资产
                outerAssetId : 1000,
                outerAssetName: "CNY",
                outerSymbol: "CNY",
                // 0有效
                status : 0,
                gateFee : 0.5,
                needMemo : true,
                minTransactionAmount : 1,
                // 1提现 2充值
                type : 1
            },
            {
                innerAssetId : 1000,
                innerAssetName: "CNY",
                innerSymbol: "CNY",
                outerAssetId : "1.3.113",
                outerAssetName: "BITCNY",
                outerSymbol: "CNY",
                status : 0,
                gateFee : 0.5,
                needMemo : false,
                minTransactionAmount : 100,
                type : 2
            }
        ];

        let activeCoinInfo = _this._getActiveCoinInfo(_this.props, {..._this.state, coins:trans_data});
        _this.setState({isAvailable:true, coins:trans_data, activeCoinInfo : activeCoinInfo});
    }

    _checkIsAgree(userName=null){
        if(!userName) userName = this.props.account.get("name")

        // 用户协议
        this._getUserInfo(userName, true);
        this.setState({isAgree : true});
    }

    componentWillMount() {
        this._checkIsAgree();
        this._getCoins();
    }

    _getWithdrawAssetId(assetName){
        let assetType= this.state.action=="deposit" ? 2 : 1;
        let assetId = this.state.coins.filter(coin =>{
            return coin.type==assetType && coin["innerSymbol"]== assetName;
        })[0].innerAssetId;
        return assetId;
    }

    _getUserInfo(userName=null, isAgree=null){
        if(!userName) userName = this.props.account.get("name")
        if(!isAgree) isAgree = this.state.isAgree
        //User must agree to the agreement
        if(!isAgree) return;
        
        this.setState({isAgree:true,user_info: {"user_id":0,"status": 0}});

    }

    onSelectCoin(e) {
        let activeCoinInfo = this.state.activeCoinInfo;
        activeCoinInfo.name = e.target.value;
        let assetId = this._getWithdrawAssetId(e.target.value);
        activeCoinInfo.id = assetId;
        this.setState({
            activeCoinInfo: activeCoinInfo
        });
        let setting = {};
        setting[`activeCoin_${this.props.provider}_${this.state.action}`] = e.target.value;
        setting[`activeCoinId_${this.props.provider}`] = assetId;
        SettingsActions.changeViewSetting(setting);
    }

    changeAction(type) {

        let activeCoinInfo = this._getActiveCoinInfo(this.props, {...this.state, action: type});
        this.setState({
            action: type,
            activeCoinInfo: activeCoinInfo
        });
        SettingsActions.changeViewSetting({[`${this.props.provider}Action`]: type});
    }

    componentWillReceiveProps(nextProps){
        if(this.props.account != nextProps.account){
            this._checkIsAgree(nextProps.account.get("name"));
        }
    }

    _updateCheck(){
        this.setState({"agreeChecked": !this.state.agreeChecked});
        this.setState({"agreeNotice": false});
    }

    _showUserAgreement(){
        ZfApi.publish("gdex_agreement", "open");
    }

    _registerUser(){
        // 确认用户协议
        if(this.state.agreeChecked){
            this._getUserInfo(null, true);
        }else{
            this.setState({"agreeNotice": true});
        }

    }
    render(){
        let {account} = this.props;
        let {coins, activeCoinInfo, action , isAvailable, user_info, isAgree, agreeChecked,
            agreeNotice, intermediate, memo_rule} = this.state;
            // 暂时删除的变量
            // 中转账号
            intermediate = "superledger.wallet";
            // 备注格式
            memo_rule = "C-BTC;B-:;D";

	    let issuer = {mail: "sherlocklee0101@126.com", qq:"682643475", telgram:"https://t.me/Superledger"};
        let supportContent=<div>
            {/*<label className="left-label">Support</label>*/}
            <br/><br/>
            <Translate content="gateway.support_gdex" /><br /><br />
            <p>Mail: <a href={(issuer.mail.indexOf("@") === -1 ? "" : "mailto:") + issuer.mail}>{issuer.mail}</a></p>
            <p>QQ群: <a target="_blank" href="//shang.qq.com/wpa/qunwpa?idkey=5d192c325146762cf5a9256038fed9faef4fcace21a36882854354dd1d599f11">{issuer.qq}</a></p>
            <p>Telegram: <a href={issuer.telgram} target="_blank">{issuer.telgram}</a></p>
        </div>
        if(!isAgree){
            return (<div>
                <span>
                    <input type="checkbox" style={{marginRight: "10px"}} checked={agreeChecked} onChange={this._updateCheck.bind(this)}/>
                    <Translate className="txtlabel" content="gateway.agreement.hint"/>
                    <a onClick={this._showUserAgreement.bind(this)}> <Translate className="txtlabel" content="gateway.agreement.name" /></a>
                </span>
                {agreeNotice? <div className="has-error" style={{paddingTop: 10}}>
                    <Translate className="txtlabel" content="gateway.agreement.notice"/>
                    </div> : null}

                <div className="buttonGroup">
                    <span style={{marginTop: "20px"}} onClick={this._registerUser.bind(this)} className=" button">
                        <Translate className="txtlabel" content="gateway.agreement.register" />
                    </span>
                </div>
                <BaseModal id={"gdex_agreement"} overlay={true}>
                    <br/>
                    <div className="grid-block vertical">
                        <SuperAgreementModal locale={this.props.settings.get("locale", "en")}/>
                    </div>
                </BaseModal>
                {supportContent}
            </div>);
        }
        if (!coins && isAvailable) {
            return <LoadingIndicator />;
        }
        if (!isAvailable) {
            return <div><Translate className="txtlabel cancel" content="gateway.unavailable" component="h4" /></div>;
        }

        var assetName = "innerAssetName";
        var assetSymbol = "innerSymbol";
        var assetId = "innerAssetId";
        var actionType = action == "deposit" ? 2 : 1;
        coins = coins.filter(coin => {
            return coin.type == actionType;
        });

        let coinOptions = coins.map(coin => {
            return <option value={coin[assetSymbol]} key={coin[assetName]}>{coin[assetName]}</option>;
        }).filter(a => {
            return a !== null;
        });

        let coin = coins.filter(coin => {
            return coin[assetSymbol] == activeCoinInfo.name;
        })[0];

        let infos =null;
        if(!coin || coin.status!=0){
            infos = <label className="left-label"><Translate className="txtlabel cancel" content="gateway.asset_unavailable" asset={activeCoinInfo.name}  component="h4"/></label>
        } else if(!user_info) {
            infos = <label className="left-label"><Translate className="txtlabel cancel" content="gateway.user_unavailable" component="h4"/></label>;
        } else if(user_info.status!=0){
            infos = <label className="left-label"><Translate className="txtlabel cancel" content="gateway.frozen" account={account.get("name")} component="h4"/></label>;
        }

        return (
            <div style={this.props.style}>
                <div className="grid-block no-margin vertical medium-horizontal no-padding">
                    <div className="medium-4">
                        <div>
                            <label style={{minHeight: "2rem"}} className="left-label"><Translate content={"gateway.choose_" + action} />: </label>
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
                        <label style={{minHeight: "2rem"}} className="left-label"><Translate content="gateway.gateway_text" />:</label>
                        <div style={{paddingBottom: 15}}>
                            <ul className="button-group segmented no-margin">
                                <li className={action === "deposit" ? "is-active" : ""}><a onClick={this.changeAction.bind(this, "deposit")}><Translate content="gateway.deposit" /></a></li>
                                <li className={action === "withdraw" ? "is-active" : ""}><a onClick={this.changeAction.bind(this, "withdraw")}><Translate content="gateway.withdraw" /></a></li>
                            </ul>
                        </div>
                    </div>
                </div>
                {infos ? infos:
                    <div>
                        <div style={{marginBottom: 15}}>
                            <SuperGatewayInfo
                                account={account}
                                coin={coin}
                                issuer_account={intermediate}
                                user_id={user_info.user_id}
                                action={this.state.action}
                                gateway={"gdex"}
                                btsCoin={coin.innerSymbol}
                                memo_rule={memo_rule}
                            />
                        </div>
                        <SuperHistory
                            userId={user_info.user_id}
                            userAccount={account.get("name")}
                            assetId={coin[assetId]}
                            assetName={coin[assetSymbol]}
                            compactView={true}
                            fullHeight={true}
                            recordType={action == "deposit" ? 1 : 2}
                            filter="transfer"
                            title={<Translate content={"gateway.recent_" + this.state.action}/>}
                        />
                    </div>
                }

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
            settings: SettingsStore.getState().settings,
        };
    }
});
