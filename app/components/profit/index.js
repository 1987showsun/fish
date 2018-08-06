import React       from 'react';
import queryString from 'query-string';
import { Line }    from 'react-chartjs-2';
import axios       from "axios";
import moment      from "moment"
import NP          from 'number-precision';
import List        from 'react-table-list-beta';

//Components
import Tool        from '../tool/profit';

//Jsons
import columns     from '../../public/json/thead.json';
import api         from '../../public/json/api.json'
import { isFunction } from 'util';

let url = process.env.NODE_ENV === 'production' ? api.production.url : api.dev.url;

let listData = {
    "code"    : 0,
    "msg"     : "成功",
    "limit"   : 10,
    "total"   : 13,
    "current" : 1,
    "list"    : []
}

//假的圖表資料
const chartsData = {
    labels   : [],
    datasets : []
}

export default class Index extends React.Component{
    constructor(props){

        const _newQuery = stupidToken( props.location.search );

        super(props);
        this.state = {
            columns     : columns['profit'],
            listData    : listData,
            chartsData  : chartsData,
            location    : props.location,
            match       : props.match,
            currentPage : props.match['params']['current'] || 1,
            cycleType   : _newQuery['cycle']               || "24H",
            uid         : _newQuery['uid']                 || '',
            token       : _newQuery['token']               || '',
            dead        : 0,
            bulletMoney : 0,
            alivesum    : 0,
            bulletsum   : 0,
            earnsum     : 0,
            fishsum     : 0,
            totalcount  : 0
        }
    }

    componentDidMount() {
        let dayData;
        let weekData;

        if (this.state.cycleType === '24H') {
            dayData = this.loadDayData(this.state.uid, this.state.token, 1, 10);
            dayData.then(res => {
                let list = res.data.list;
                if (list) {
                    let listData = this.dayList(list);
                    this.setState({
                        listData    : listData,
                        dead        : listData.totalDead,
                        bulletMoney : listData.totalBullet,
                        alivesum    : res['data']['alivesum'],
                        bulletsum   : res['data']['bulletsum'],
                        earnsum     : res['data']['earnsum'],
                        fishsum     : res['data']['fishsum'],
                        totalcount  : res['data']['totalcount']
                    })
                }
            });
        } else {
            weekData = this.loadWeekData(this.state.uid, this.state.token);
            weekData.then(res => {
                let list = res.data;
                
                if (list) {
                    let chartsData = this.weekListData(list);

                    this.setState({
                        chartsData  : chartsData,
                        dead        : chartsData.totalDead,
                        bulletMoney : chartsData.totalBullet
                    })
                }
            });
        }
    }

    componentDidUpdate(prevProps, prevState){
        if (this.state.cycleType !== prevState.cycleType) {
            let dayData;
            let weekData;

            if (this.state.cycleType === '24H') {
                dayData = this.loadDayData(this.state.uid, this.state.token, 1, 10);
                dayData.then(res => {
                    let list = res.data.list;
                    
                    if (list) {
                        let listData = this.dayList(list);
                        
                        this.setState({
                            listData    : listData,
                            dead        : listData.totalDead,
                            bulletMoney : listData.totalBullet
                        })
                    }
                });
            } else {
                weekData = this.loadWeekData(this.state.uid, this.state.token);
                weekData.then(res => {
                    let list = res.data;
                    
                    if (list.length > 0) {
                        let chartsData = this.weekListData(list);

                        this.setState({
                            chartsData  : chartsData,
                            dead        : chartsData.totalDead,
                            bulletMoney : chartsData.totalBullet
                        })
                    }
                });
            }
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            location    : nextProps.location,
            match       : nextProps.match,
            cycleType   : queryString.parse(nextProps.location.search)['cycle'] || "24H"
        })
    }

    reloadAData(status,selectedCP){
        let dayData;

        if (this.state.cycleType === '24H') {
            dayData = this.loadDayData(this.state.uid, this.state.token, selectedCP, 10);
            dayData.then(res => {
                console.log(res.data.list);
                let list = res.data.list;

                if (list) {
                    let listData = this.dayList(list);

                    this.setState({
                        listData    : listData,
                        dead        : listData.totalDead,
                        bulletMoney : listData.totalBullet
                    })
                }
            });
        }
    }

    loadDayData(uid, token, page=1, pagesize=10) {
        let dataPromise = this.axiosMethod('get', `http://${url}/fishstore/daystatistics.do`, {
                uid: uid,
                token: token,
                page: page,
                pagesize: pagesize
            });

        return dataPromise;
    }

    loadWeekData(uid, token) {
        let dataPromise = this.axiosMethod('get', `http://${url}/fishstore/statistics.do`, {
                uid: uid,
                token: token
            });

        return dataPromise;
    }

    dayList(list) {
        let totalDead = 0;
        let totalBullet = 0;
        let listData = {
            "code"    : 0,
            "msg"     : "成功",
            "limit"   : 10,
            "total"   : 13,
            "current" : 1,
            "list"    : []
        }

        for (let item of list) {
            if (item.fishTotal) {
                totalDead = NP.plus(totalDead, item.fishTotal);
            }
            if (item.bulletMoney) {
                totalBullet = NP.plus(totalBullet, item.bulletMoney);
            }
            
            listData.list.push({
                "name"         : item.name,
                "rate"         : item.rate,
                "fishMoney"    : item.fishMoney,
                "fishTotal"    : item.fishTotal,
                "total"        : item.rate * item.dead,
                "bulletMoney"  : item.bulletMoney,
                "earn"         : item.earn,
                "alive"        : item.alive,
                "dead"         : item.dead
            });
        }

        listData.totalDead = totalDead;
        listData.totalBullet = totalBullet;
        
        return listData;
    }

    weekListData(list) {
        list.reverse();
        let labels = [];
        let totalDead = 0;
        let totalBullet = 0;
        let datasets = [{
            label: '子弹收入',
            data : [],
            backgroundColor : "transparent",
            borderColor     : "rgba(0,200,0,1)"
        },
        {
            label: '买鱼支出',
            data : [],
            backgroundColor : "transparent",
            borderColor     : "rgba(200,0,0,1)"
        }];

        for (let item of list) {
            labels.push(moment(item.date).format('YY/MM/DD'));

            if (item.cost) {
                totalDead = NP.plus(totalDead, item.cost);
            }
            if (item.earn) {
                totalBullet = NP.plus(totalBullet, item.earn);
            }
            
            datasets[0].data.push(item.earn);
            datasets[1].data.push(item.cost);
        }

        return { labels:labels, datasets:datasets, totalDead:totalDead, totalBullet:totalBullet };
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
            <div className="ifram-block">
                <Tool location={this.state.location} match={this.state.match} uid={this.state.uid} token={this.state.token} dead={this.state.dead} bullet={this.state.bulletMoney}/>
                <div className="ifram-content">
                    <div className="ifram-content-in">
                        {
                            this.state.cycleType==="24H"?(
                                <List 
                                    match           = { this.state.match }
                                    total           = { this.state.listData['total'] }
                                    limit           = "10"
                                    columns         = { this.state.columns }
                                    data            = { this.state.listData['list'] }
                                    currentPage     = { this.state.currentPage }
                                    paginationStyle = "model2"
                                    paginationPath  = {`/${url[1]}`}
                                    paginationSearch= {`${this.state.location['search']}`}
                                    reload          = { this.reloadAData.bind(this) }
                                >
                                    <ul className="total">
                                        <li>共计</li>
                                        <li>$ {this.state.fishsum}</li>
                                        <li>$ {this.state.earnsum}</li>
                                        <li>$ {this.state.alivesum}</li>
                                    </ul>
                                </List>
                            ):(
                                <Line data={this.state.chartsData}/>                              
                            )
                        }
                    </div>
                </div>
            </div>
        );
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