import React       from 'react';
import { NavLink } from 'react-router-dom';
import queryString from 'query-string';

//images
import btn            from '../record/img/btn_bg.png';
import btn_current    from '../record/img/btn_bg_current.png';
import change_bg      from '../record/img/change_bg.png';
import left_btn       from '../record/img/left_btn.png';

export default class Record extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            initType : "remainder",
            location : props.location,
            match    : props.match,
            uid      : props.uid,
            token    : props.token
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            location : nextProps.location,
            match    : nextProps.match,
            uid      : nextProps.uid,
            token    : nextProps.token
        })
    }

    checkCurrentLink(type){
        const currentType = this.state.match['params']['type'] || this.state.initType;
        if( currentType==type ){
            return "active";
        }
    }

    render(){

        const currentType = this.state.match['params']['type'] || this.state.initType;
        const type        = `${this.state.match['url'].split('/')[1]}`;
        const location    = queryString.parse(this.state.location.search);
        const cycle       = queryString.parse(this.state.location.search)['cycle'] || "24H";
        const query       = queryString.stringify( location );

        return(
            <div className="ifram-tool">
                <ul className="tool-ul">
                    <li>
                        <NavLink className={this.checkCurrentLink("remainder")} to={`/${type}/remainder?uid=${this.state.uid}&token=${this.state.token}`}>
                            <span className="nav_text">仍存活的鱼</span>
                            <img src={btn} alt="" title="" className="no_current"/>
                            <img src={btn_current} alt="" title="" className="current"/>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink className={this.checkCurrentLink("income")} to={`/${type}/income${query!="" ? "?"+query : ""}`}>
                            <span className="nav_text">收入/支出</span>
                            <img src={btn} alt="" title="" className="no_current"/>
                            <img src={btn_current} alt="" title="" className="current"/>
                        </NavLink>
                    </li>
                </ul>
                {
                    currentType=="income" &&
                        <div className="change_block">
                            <NavLink to={`?cycle=24H&uid=${this.state.uid}&token=${this.state.token}`} className="btn change_block_left"><img src={left_btn} alt="" title="" /></NavLink>
                            <NavLink to={`?cycle=week&uid=${this.state.uid}&token=${this.state.token}`} className="btn change_block_right"><img src={left_btn} alt="" title="" /></NavLink>
                            <div className="text">
                                {
                                    cycle=="24H"?(
                                        "24小时"
                                    ):(
                                        "一週"
                                    )
                                }
                            </div>
                            <img src={change_bg} alt="" title="" />
                        </div>
                }
            </div>
        );
    }
}