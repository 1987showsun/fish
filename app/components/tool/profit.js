import React       from 'react';
import { NavLink } from 'react-router-dom';
import queryString from 'query-string';

//images
import expenditure_bg from '../profit/img/expenditure_bg.png';
import income_bg      from '../profit/img/income_bg.png';
import change_bg      from '../profit/img/change_bg.png';
import left_btn       from '../profit/img/left_btn.png';


export default class Profit extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            location : props.location,
            match    : props.match,
            uid      : props.uid,
            token    : props.token,
            dead     : props.dead,
            bullet   : props.bullet
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            location : nextProps.location,
            match    : nextProps.match,
            uid      : nextProps.uid,
            token    : nextProps.token,
            dead     : nextProps.dead,
            bullet   : nextProps.bullet
        })
    }

    render(){

        const type     = `${this.state.match['url'].split('/')[1]}`;
        const cycle    = queryString.parse(this.state.location.search)['cycle'] || "24H";

        return(
            <div className="ifram-tool move-left">
                <ul className="tool-ul">
                    <li>
                        <div className="text color1">{this.state.dead} 元</div>
                        <img src={expenditure_bg} alt="" title="" />
                    </li>
                    <li>
                        <div className="text color2">{this.state.bullet} 元</div>
                        <img src={income_bg} alt="" title="" />
                    </li>
                </ul>

                <div className="change_block">
                    <NavLink to={`/${type}?cycle=24H&uid=${this.state.uid}&token=${this.state.token}`} className="btn change_block_left"><img src={left_btn} alt="" title="" /></NavLink>
                    <NavLink to={`/${type}?cycle=week&uid=${this.state.uid}&token=${this.state.token}`} className="btn change_block_right"><img src={left_btn} alt="" title="" /></NavLink>
                    <div className="text">
                        {
                            cycle=="24H"?(
                                "24小時"
                            ):(
                                "一週"
                            )
                        }
                    </div>
                    <img src={change_bg} alt="" title="" />
                </div>
            </div>
        );
    }
}