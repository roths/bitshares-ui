import React from "react";
import ChainTypes from "components/Utility/ChainTypes";
import BindToChainState from "components/Utility/BindToChainState";



class AccountID extends React.Component {

    constructor() {
        super();

    }

	static propTypes = {
		"account" : ChainTypes.ChainAccount.isRequired
	};

	render() {
		return <div style={{"font-size":"0.7rem"}}>{"ID：#" + this.props.account.get("id").substring(4)}</div> ;
	}
}

export default BindToChainState(AccountID, {keep_updating: true});