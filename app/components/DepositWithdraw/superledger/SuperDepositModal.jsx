import React from "react";
import Translate from "react-translate-component";
import BindToChainState from "components/Utility/BindToChainState";
import utils from "common/utils";
import counterpart from "counterpart";
import ZfApi from "react-foundation-apps/src/utils/foundation-api";
import Modal from "react-foundation-apps/src/modal";
import Icon from "components/Icon/Icon";
var alipayIcon = require("assets/alipay.jpg");
var wechatIcon = require("assets/wechat.jpg");


class SuperDepositModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            memo: "",
            payway: "bank"
        };

    }

    changeAction(payway) {
        this.setState({payway:payway});
    }

    render() {

        let {memo, payway} = this.state;

        let tabIndex = 1;
        let withdraw_memo = null;
        memo = "sdfsdfsdf"

        withdraw_memo =
			<div className="content-block">
				<label><Translate component="span" content="transfer.memo"/></label>
				<textarea rows="1" value={memo} tabIndex={tabIndex++} />
			</div>;

        return (<form className="grid-block vertical full-width-content">
            <div className="grid-container">
                <div className="content-block">
                    <h3><Translate content="gateway.desposit_coin" coin={this.props.output_coin_symbol} /></h3>
                </div>

                <div className="grid-block no-margin vertical medium-horizontal" style={{paddingBottom: 15}}>
                    <div className="medium-6">
                        <span>选择支付方式：</span>
                        <ul className="button-group segmented no-margin">
                            <li className={payway === "bank" ? "is-active" : ""}><a onClick={this.changeAction.bind(this, "bank")}><Translate content="gateway.payway.bank" /></a></li>
                            <li className={payway === "alipay" ? "is-active" : ""}><a onClick={this.changeAction.bind(this, "alipay")}><Translate content="gateway.payway.alipay" /></a></li>
                            <li className={payway === "wechat" ? "is-active" : ""}><a onClick={this.changeAction.bind(this, "wechat")}><Translate content="gateway.payway.wechat" /></a></li>
                        </ul>
                    </div>
                    <div className="medium-6" style={{"display":"flex","flex-direaction":"row","align-items":"baseline"}}>
                        <Translate content="gateway.fee" />
                        <input style={{"width":"70%"}} type="text" disabled value={(this.props.gateFee ? this.props.gateFee : 0) + "%"} />
                    </div>
                </div>
                <div className="grid-block">
                        {payway === "bank" 
                        ? 
                        <div className="medium-6">
                        <p>微信联系：quicksnake<br/>姓名：李兆豪<br/>工商银行卡号：6222023602099054066</p>
                        </div>
                        :
                        <div className="medium-6">
                            <label >扫描二维码，手机支付</label>
                            <img src={payway === "wechat" ? wechatIcon : alipayIcon} style={{width: "15rem"}} />
                        </div>
                        }
                    <div className="medium-6">
                    <p>请在备注上写上<br/>账户名：#账户ID（ID位于页面右上角）</p>
                    </div>
                </div>
            </div>
            </form>
	    );
    }
};

export default BindToChainState(SuperDepositModal, {keep_updating:true});
