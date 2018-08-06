import React from 'react';
import queryString from 'query-string';
import { Line }    from 'react-chartjs-2';
import axios       from 'axios'
import moment      from "moment"

//Components
import Tool from '../tool/record';
import List        from '../list';

//Jsons
import columns     from '../../public/json/thead.json';
import api         from '../../public/json/api.json'

let url = process.env.NODE_ENV === 'production' ? api.production.url : api.dev.url;

let listData = {
    "code"    : 0,
    "msg"     : "成功",
    "limit"   : 10,
    "total"   : 13,
    "current" : 1,
    "list"    : []
}

export default class Index extends React.Component{

    constructor(props){

        const initType = "remainder";
        const _newQuery = stupidToken( props.location.search );

        super(props);
        this.state = {
            initType    : initType,
            columns     : columns[props.match['params']['type']  || initType ],
            listData    : listData                               || [],
            location    : props.location,
            match       : props.match,
            type        : props.match['params']['type']          || initType,
            currentPage : props.match['params']['current']       || 1,
            cycleType   : _newQuery['cycle']                     || "24H",
            uid         : _newQuery['uid']                       || '',
            token       : _newQuery['token']                     || '',
            bulletsum   : 0,
            pricesum    : 0,
            totalcount  : 0,
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            columns     : columns[nextProps.match['params']['type'] || this.state.initType ],
            listData    : listData || [],
            location    : nextProps.location,
            match       : nextProps.match,
            type        : nextProps.match['params']['type'] || "remainder",
            currentPage : nextProps.match['params']['current'] || 1,
            cycleType   : queryString.parse(nextProps.location.search)['cycle'] || "24H",
        })
    }

    componentDidMount() {
        let dayData;
        let weekData;
        let aliveFishData;

        if (this.state.type === 'remainder') {
            aliveFishData = this.loadAliveFishData(this.state.uid, this.state.token, 2, 1, 1, 10);
            aliveFishData.then(res => {
                let list = res.data.list;

                if (list) {
                    let listData = this.makeAliveList(list);
                    
                    this.setState({
                        listData    : listData
                    })
                }
            });
        }

        if (this.state.type === 'income' && this.state.cycleType === '24H') {
            dayData = this.loadAliveFishData(this.state.uid, this.state.token, 1, 1, 1, 10);
            dayData.then(res => {
                console.log( res );
                let list = res.data.list;

                if (list) {
                    let listData = this.makeList(list);
                    
                    this.setState({
                        listData    : listData,
                        bulletsum   : res['data']['bulletsum'],
                        pricesum    : res['data']['pricesum'],
                        totalcount  : res['data']['totalcount'],
                    })
                }
            });
        }

        if (this.state.type === 'income' && this.state.cycleType === 'week') {
            weekData = this.loadAliveFishData(this.state.uid, this.state.token, 2, 1, 1, 10);
            weekData.then(res => {
                let list = res.data;

                if (list) {
                    let listData = this.makeList(list);

                    this.setState({
                        listData    : listData
                    })
                }
            });
        }
    }

    componentDidUpdate(prevProps, prevState){
        let dayData;
        let weekData;
        let aliveFishData;

        if (this.state.type === 'remainder' && prevState.type !== 'remainder') {
            aliveFishData = this.loadAliveFishData(this.state.uid, this.state.token, 2, 1, 1, 10);
            aliveFishData.then(res => {
                let list = res.data.list;

                if (list) {
                    let listData = this.makeAliveList(list);
                    
                    this.setState({
                        listData    : listData
                    })
                }
            });
        }

        if ((this.state.type === 'income' && prevState.type !== 'income' && this.state.cycleType === '24H') || 
            (this.state.type === 'income' && this.state.cycleType === '24H' && prevState.cycleType !== '24H')) {
            dayData = this.loadAliveFishData(this.state.uid, this.state.token, 1, 1, 1, 10);
            dayData.then(res => {
                let list = res.data.list;

                if (list) {
                    let listData = this.makeList(list);
                    
                    this.setState({
                        listData    : listData
                    })
                }
            });
        }

        if (this.state.type === 'income' && this.state.cycleType === 'week' && prevState.cycleType !== 'week') {
            weekData = this.loadAliveFishData(this.state.uid, this.state.token, 2, 1, 1, 10);
            weekData.then(res => {
                let list = res.data.list;

                if (list) {
                    let listData = this.makeList(list);

                    this.setState({
                        listData  : listData,
                    })
                }
            });
        }
    }

    reloadAData(status,selectedCP){
        let dayData;
        let weekData;
        let aliveFishData;

        if (this.state.type === 'remainder') {
            aliveFishData = this.loadAliveFishData(this.state.uid, this.state.token, 2, 1, selectedCP, 10);
            aliveFishData.then(res => {
                let list = res.data.list;

                if (list) {
                    let listData = this.makeAliveList(list);
                    
                    this.setState({
                        listData    : listData
                    })
                }
            });
        }

        if (this.state.type === 'income' && this.state.cycleType === '24H') {
            dayData = this.loadAliveFishData(this.state.uid, this.state.token, 1, 1, selectedCP, 10);
            dayData.then(res => {
                let list = res.data.list;

                if (list) {
                    let listData = this.makeList(list);

                    this.setState({
                        listData    : listData,
                        currentPage : 1
                    })
                }
            });
        }

        if (this.state.type === 'income' && this.state.cycleType === 'week') {
            weekData = this.loadAliveFishData(this.state.uid, this.state.token, 2, 1, selectedCP, 10);
            weekData.then(res => {
                let list = res.data.list;

                if (list) {
                    let listData = this.makeList(list);

                    this.setState({
                        listData  : listData,
                        currentPage : 1
                    })
                }
            });
        }
    }

    loadAliveFishData(uid, token, period, type, page=1, pagesize=10) {
        let dataPromise = this.axiosMethod('get', `http://${url}/fishstore/fishstatus.do`, {
            uid: uid,
            token: token,
            period: period,
            type: type,
            page: page,
            pagesize: pagesize
        });

        return dataPromise;
    }

    makeList(list) {
        let listData = {
            "code"    : 0,
            "msg"     : "成功",
            "limit"   : 10,
            "total"   : 13,
            "current" : 1,
            "list"    : []
        }

        for (let item of list) {
            listData.list.push({
                "name"         : item.name,
                "id"           : item.id,
                "rate"         : item.rate,
                "price"        : item.price,
                "bulletMoney"  : item.bulletMoney,
                "status"       : item.status,
                "settleTime"   : moment(item.settleTime).format("YYYY/MM/DD HH:mm:ss"),
                "createTime"   : moment(item.createTime).format("YYYY/MM/DD HH:mm:ss")
            });
        }

        return listData;
    }

    makeAliveList(list) {
        let listData = {
            "code"    : 0,
            "msg"     : "成功",
            "limit"   : 10,
            "total"   : 13,
            "current" : 1,
            "list"    : []
        }

        for (let item of list) {
            listData.list.push({
                "name"         : item.name,
                "id"           : item.id,
                "price"        : item.price,
                "bulletMoney"  : item.bulletMoney,
                "status"       : item.status
            });
        }

        return listData;
    }

    axiosMethod(method, path, params) {
        return axios({
            method: method,
            url: path,
            params
        }).then(res=>{return res});
    }

    render(){
        const url = this.state.match['url'].split('/');

        return(
            <div className="ifram-block limitHeight">
                <Tool location={this.state.location} match={this.state.match} uid={this.state.uid} token={this.state.token}/>
                <div className="ifram-content">
                    {
                        <List 
                            match           = { this.state.match }
                            total           = { this.state.listData['total'] }
                            limit           = "10"
                            columns         = { this.state.columns }
                            data            = { this.state.listData['list'] }
                            currentPage     = { this.state.currentPage }
                            paginationStyle = "model2"
                            paginationPath  = {`/${url[1]}/${url[2]}`}
                            paginationSearch= {`${this.state.location['search']}`}
                            reload          = { this.reloadAData.bind(this) }
                        >
                            <ul className="total">
                                <li>共計：{this.state.pricesum}</li>
                                <li>共計：{this.state.bulletsum}</li>
                                <li>共計：{this.state.totalcount}</li>
                            </ul>
                        </List>
                    }
                </div>
            </div>
        )
    }
}

const stupidToken = ( beforeQuery ) => {
    const _query     = queryString.parse(beforeQuery);
    const _search    = beforeQuery.split('&');
    const findToken  = _search.find((item,i)=>{
        return item.indexOf("token=")==0 || item.indexOf("?token=")==0;
    });

    if( findToken!=undefined ){
        let replaceString = findToken.indexOf('?')==0? findToken.replace("?token=","") : findToken.replace("token=","")
        delete _query['token'];
        _query["token"] = replaceString;
    }
    return _query;
}