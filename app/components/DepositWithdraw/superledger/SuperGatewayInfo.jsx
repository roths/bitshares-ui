import React from "react";
import BindToChainState from "components/Utility/BindToChainState";
import Translate from "react-translate-component";
import LoadingIndicator from "../../LoadingIndicator";
import AssetName from "../../Utility/AssetName";
import LinkToAccountById from "../../Utility/LinkToAccountById";
import AccountBalance from "../../Account/AccountBalance";
import BaseModal from "../../Modal/BaseModal";
import ChainTypes from "../../Utility/ChainTypes";
import ZfApi from "react-foundation-apps/src/utils/foundation-api";
import BalanceComponent from "../../Utility/BalanceComponent";
import BlockTradesDepositAddressCache from "../../../lib/common/BlockTradesDepositAddressCache";
import QRCode from "qrcode.react";
import SuperWithdrawModal from "./SuperWithdrawModal";
import SuperDepositModal from "./SuperDepositModal";

class SuperGatewayInfo extends React.Component {
    static propTypes = {
        // inner_asset_name:               React.PropTypes.string,
        // outer_asset_name:           React.PropTypes.string,
        account: ChainTypes.ChainAccount,
        issuer_account: ChainTypes.ChainAccount,
        gateway: React.PropTypes.string,
        btsCoin: ChainTypes.ChainAsset,
        memo_rule: React.PropTypes.string
    };

    static defaultProps = {
        autosubscribe: false
    };

    constructor(){
        super();
        this.state = {
            receive_address: null,
            isAvailable:true
        };
        this.deposit_address_cache = new BlockTradesDepositAddressCache();
    }

    componentWillMount(){
    }

    componentWillReceiveProps(np) {
    }

    componentWillUnmount() {
    }

    getWithdrawModalId() {
        return "withdraw_asset_"+this.props.issuer_account.get("name") + "_"+this.props.coin.innerSymbol;
    }

    getDepositModalId() {
        return "deposit_asset_"+this.props.issuer_account.get("name") + "_"+this.props.coin.innerSymbol;
    }

    onWithdraw() {
        ZfApi.publish(this.getWithdrawModalId(), "open");
    }

    onDeposit() {
        ZfApi.publish(this.getDepositModalId(), "open");
    }

    render() {
        let emptyRow = <div style={{display:"none", minHeight: 150}}></div>;
        if( !this.props.account || !this.props.issuer_account || !this.props.coin )
            return emptyRow;
        const { coin, btsCoin } = this.props;

        // asset is not loaded
        if(!btsCoin) return emptyRow;
        let receive_address = this.state.receive_address;
        let withdraw_modal_id = this.getWithdrawModalId();
        let deposit_modal_id = this.getDepositModalId();
        let clipboardText = "";

        var withdraw_memo_prefix = coin.outerSymbol + ":";
        let balance = null;
        let account_balances_object = this.props.account.get("balances");

        if(account_balances_object) balance = account_balances_object.toJS()[btsCoin.get("id")];

        if (this.props.action === "deposit") {
            return (
                <div className="Blocktrades__gateway grid-block no-padding no-margin">
                    <div className="small-12 medium-5">
                        <Translate component="h4" content="gateway.deposit_summary" />
                        <div className="small-12 medium-10">
                            <table className="table">
                                <tbody>
                                <tr>
                                    <Translate component="td" content="gateway.asset_to_deposit" />
                                    <td style={{fontWeight: "bold", color: "#4A90E2", textAlign: "right"}}>{coin.innerSymbol}</td>
                                </tr>
                                <tr>
                                    <Translate component="td" content="gateway.asset_to_receive" />
                                    <td style={{fontWeight: "bold", color: "#4A90E2", textAlign: "right"}}><AssetName name={coin.outerSymbol} replace={false} /></td>
                                </tr>
                                <tr>
                                    <Translate component="td" content="gateway.intermediate" />
                                    <td style={{fontWeight: "bold", color: "#4A90E2", textAlign: "right"}}><LinkToAccountById account={this.props.issuer_account.get("id")} /></td>
                                </tr>
                                <tr>
                                    <Translate component="td" content="gateway.your_account" />
                                    <td style={{fontWeight: "bold", color: "#4A90E2", textAlign: "right"}}><LinkToAccountById account={this.props.account.get("id")} /></td>
                                </tr>
                                <tr>
                                    <td><Translate content="gateway.balance" />:</td>
                                    <td style={{fontWeight: "bold", color: "#4A90E2", textAlign: "right"}}>
                                        <AccountBalance
                                            account={this.props.account.get("name")}
                                            asset={coin.outerSymbol}
                                            replace={false}
                                        />
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="small-12 medium-7">
                        <Translate component="h4" content="gateway.deposit_inst" />
                        <label className="left-label"><Translate content="gateway.deposit_to_click" asset={coin.innerAssetName} />:</label>
                        <div className="button-group" style={{paddingTop: 20}}>
                            <Translate className="button" content="gateway.deposit" style={{fontSize: "1.3rem"}} onClick={this.onDeposit.bind(this)}/>
                        </div>
                    </div>
                    <BaseModal id={deposit_modal_id} overlay={true}>
                        <br/>
                        <div className="grid-block vertical">
                            <SuperDepositModal
                                account={this.props.account.get("name")}
                                issuer={this.props.issuer_account.get("name")}
                                asset={coin.innerSymbol}
                                output_coin_name={coin.outerAssetName}
                                gateFee={coin.gateFee}
                                output_coin_id = {coin.outerAssetId}
                                output_coin_symbol={coin.outerSymbol}
                                output_supports_memos={coin.needMemo==1}
                                minWithdrawAmount = {coin.minTransactionAmount}
                                memo_prefix={withdraw_memo_prefix}
                                modal_id={deposit_modal_id}
                                balance={balance} />
                        </div>
                    </BaseModal>
                </div>
            );
        } else {
            return (
                <div className="Blocktrades__gateway grid-block no-padding no-margin">
                    <div className="small-12 medium-5">
                        <Translate component="h4" content="gateway.withdraw_summary" />
                        <div className="small-12 medium-10">
                            <table className="table">
                                <tbody>
                                <tr>
                                    <Translate component="td" content="gateway.asset_to_withdraw" />
                                    <td style={{fontWeight: "bold", color: "#4A90E2", textAlign: "right"}}><AssetName name={coin.innerSymbol} replace={false} /></td>
                                </tr>
                                <tr>
                                    <Translate component="td" content="gateway.asset_to_receive" />
                                    <td style={{fontWeight: "bold", color: "#4A90E2", textAlign: "right"}}>{coin.outerSymbol}</td>
                                </tr>
                                <tr>
                                    <Translate component="td" content="gateway.intermediate" />
                                    <td style={{fontWeight: "bold", color: "#4A90E2", textAlign: "right"}}><LinkToAccountById account={this.props.issuer_account.get("id")} /></td>
                                </tr>
                                <tr>
                                    <td><Translate content="gateway.balance" />:</td>
                                    <td style={{fontWeight: "bold", color: "#4A90E2", textAlign: "right"}}>
                                        <AccountBalance
                                            account={this.props.account.get("name")}
                                            asset={coin.innerSymbol}
                                            replace={false}
                                        />
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="small-12 medium-7">
                        <Translate component="h4" content="gateway.withdraw_inst" />
                        <label className="left-label"><Translate content="gateway.withdraw_to" asset={coin.innerAssetName} />:</label>
                        <div className="button-group" style={{paddingTop: 20}}>
                            <button className="button success" style={{fontSize: "1.3rem"}} onClick={this.onWithdraw.bind(this)}><Translate content="gateway.withdraw_now" /> </button>
                        </div>
                    </div>
                    <BaseModal id={withdraw_modal_id} overlay={true}>
                        <br/>
                        <div className="grid-block vertical">
                            <SuperWithdrawModal
                                account={this.props.account.get("name")}
                                issuer={this.props.issuer_account.get("name")}
                                asset={coin.innerSymbol}
                                output_coin_name={coin.outerAssetName}
                                gateFee={coin.gateFee}
                                output_coin_id = {coin.outerAssetId}
                                output_coin_symbol={coin.outerSymbol}
                                output_supports_memos={coin.needMemo==1}
                                minWithdrawAmount = {coin.minTransactionAmount}
                                memo_prefix={withdraw_memo_prefix}
                                modal_id={withdraw_modal_id}
                                balance={balance} />
                        </div>
                    </BaseModal>
                </div>
            );
        }
    }

}


export default BindToChainState(SuperGatewayInfo, {keep_updating:true});