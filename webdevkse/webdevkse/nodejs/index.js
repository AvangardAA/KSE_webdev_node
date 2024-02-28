const fs = require('fs');
const path = require('path');

const logpath = path.join(__dirname, 'logs', 'ws_service.log');

function logws(msg) 
{
    fs.appendFile(logpath, `${new Date().toISOString()} - ${msg}\n`, (e) => 
    {
        if (e) 
        {
            console.error('cant write to file: ', e);
        }
    });
}

const WebSocket = require('ws');
const mongoose = require('mongoose');
const uri_m = 'mongodb+srv://dbkse:pzz6CHKyqqjxa0CW@cluster0.pc3wpi6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(uri_m);
const db = mongoose.connection;
const ws_client = new WebSocket('ws://localhost:8000/ws/bin_feed/');

db.on('error', console.error.bind(console, 'error connecting to mongo:'));
db.once('open', () => logws('connect to mongo success'));

const arb_schema = new mongoose.Schema({
    cycle: String,
    result: Number,
    timestamp: Date
});

const arb_cycle = mongoose.model('ArbitrageCycle', arb_schema);
let lastPrices = {};
let lastArbTs = {};

ws_client.on('open', function open() 
{
    logws('connect to consumer success');
});

function find_res(prices) 
{
    return 1000 - (((1000 / prices[0]) / prices[1]) * prices[2]); // for 1000$ fixed amount
}

ws_client.on('message', async function incoming(msg) 
{
    /* this handler is constantly checking for new arbitrage opportunities and has 30 sec delay for such one */
    const dt = JSON.parse(msg);
    const symbol = dt.stream.split('@')[0];
    const price = parseFloat(dt.data.p);

    lastPrices[symbol] = price;

    const arb_cycles = [
        ["btcusdt", "ethusdt", "ethbtc"],
        ["xrpusdt", "btcusdt", "xrpbtc"],
        ["maticusdt", "btcusdt", "maticbtc"],
        ["dotusdt", "btcusdt", "dotbtc"],
    ];

    for (const cycle of arb_cycles) 
    {
        const c_price = cycle.map(p => lastPrices[p]);

        if (c_price.every(price => typeof price === 'number')) 
        {
            const c_res = find_res(c_price);
            const c_time = new Date();
            const c_name = cycle.join('_');
            if (c_res > 0.1 && (!lastArbTs[c_name] || c_time - lastArbTs[c_name] > 30 * 1000)) // larger than 0.1 and not undefined and time difference more than 30 sec
            {
                const arb_opp = await arb_cycle.findOne({ cycle: c_name, timestamp: { $gte: new Date(c_time - 30 * 1000) } });

                if (!arb_opp) 
                {
                    const arb_inst = new arb_cycle({ cycle: c_name, result: c_res, timestamp: c_time });
                    try 
                    {
                        await arb_inst.save();
                        lastArbTs[c_name] = c_time;
                    } 
                    catch (e) 
                    {
                        logws("duplicate exists in mongo");
                    }
                } 
                else 
                {
                    logws("duplicate exists in mongo");
                }

                setTimeout(() => 
                {
                    lastArbTs[c_name] = null;

                }, 30 * 1000); // 30 sec sleep
            }
        }
    }
});
