const socket = new WebSocket("ws://localhost:8000/ws/bin_feed/");
const market_feed = [];

socket.onopen = function(event) 
{
    console.log("connect to websocket success");
};

socket.onmessage = function(event) 
{
    const dt = JSON.parse(event.data);
    feed_container(dt);
};

socket.onclose = function(event) 
{
    console.log("closed connection to websocket");
};

function create_report() 
{
    const r_name = document.getElementById('report-name').value;
    const r_comment = document.getElementById('report-comment').value;

    send_to_django({ type: 'create', title: r_name, comment: r_comment });
}

function update_report() 
{
    const r_name = document.getElementById('report-name').value;
    const r_comment = document.getElementById('report-comment').value;

    send_to_django({ type: 'update', title: r_name, comment: r_comment });
}

function delete_report() 
{
    const r_name = document.getElementById('report-name').value;

    send_to_django({ type: 'delete', title: r_name });
}

function send_to_django(dt) 
{
    fetch('/get_best_opp/')
        .then(response => response.json())
            .then(best_opp => 
                {
                    if (best_opp.result !== undefined) 
                    {
                        dt.arbitrage_opportunity = best_opp.result;
                    }

                    fetch('/report/', 
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'type': dt.type
                        },
                        body: JSON.stringify(dt)
                    })
                    .then(response => 
                        {
                            if (response.ok) 
                            {
                                console.log('report sent success');
                            } 
                            else 
                            {
                                console.error('report sent fail, status: ', response.status);
                            }
                        })
                    .catch(e => console.error('js error when sending report: ', e));
                })
            .catch(e => console.error('get best opportunity failed: ', e));
}

function get_reports() 
{
    fetch('/report/')
        .then(response => response.json())
            .then(reports => 
                {
                    const rep_cont = document.getElementById("report-container");
                    rep_cont.innerHTML = '';

                    reports.forEach(report => 
                    {
                        const rep_div = document.createElement("div");
                        rep_div.innerHTML = `<h3>${report.title}</h3><p>${report.comment}</p><p>Arbitrage opportunity: ${report.arbitrage_opportunity}</p>`;
                        rep_cont.appendChild(rep_div);
                    });
                })
            .catch(e => console.error('get reports error: ', e));
}


function feed_container(dt) 
{
    if (market_feed.length >= 10) 
    {
        market_feed.shift();
    }
    market_feed.push(dt);

    const feed_cont = document.getElementById("feed-container");
    feed_cont.innerHTML = '';

    for (let i = market_feed.length - 1; i >= 0; i--) 
    {
        const new_price = document.createElement("div");
        const new_s_line = document.createElement("p");
        
        const price = parseFloat(market_feed[i].data.p).toFixed(5);

        new_s_line.textContent = `Symbol: ${market_feed[i].data.s}, Price: ${price}`;
        
        if (market_feed[i].data.s === 'BTCUSDT') 
        {
            new_s_line.style.color = 'green';
        }

        new_price.style.width = '300px';

        new_price.appendChild(new_s_line);
        feed_cont.appendChild(new_price);
    }
}


function compare()
{
    fetch('/compare/')
        .then(response => response.json())
            .then(data => 
                {
                    const comp_cont = document.getElementById("compare-container");
                    comp_cont.innerHTML = '';

                    for (const symbol in data) 
                    {
                        const pair_block = document.createElement("div");
                        pair_block.innerHTML = `<h2>${symbol}</h2>`;
                        for (const pair in data[symbol]) 
                        {
                            const info = data[symbol][pair];
                            pair_block.innerHTML += `<p>${pair} - Low: ${info.low}, High: ${info.high}, Volume: ${info.volume} USDT</p>`;
                        }
                        comp_cont.appendChild(pair_block);
                    }
                })
            .catch(e => console.error('get compare error: ', e));
}

function get_best_opp() 
{
    fetch('/get_best_opp/')
        .then(response => response.json())  
            .then(data => 
                {
                    const best_opp_cont = document.getElementById("best-opportunity");
                    best_opp_cont.innerHTML = ''; 

                    const best_opp_line = document.createElement("p");
                    best_opp_line.textContent = `Cycle: ${data.cycle}, Result: ${data.result}`;
                    best_opp_cont.appendChild(best_opp_line);
                })
            .catch(e => console.error('get best opportunity error: ', e));
}