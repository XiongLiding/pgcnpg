const fs = require('fs');
const express = require('express');
const app = express();
const axios = require('axios');
const cheerio = require('cheerio');
const litdate = require('./litdate');

app.set('view engine', 'pug');

let dataset = [];
let analysis = {};
let lastupdate;

const getHtml = async () => {
  try {
    const res = await axios.get(
      'https://github.com/postgres-cn/pgdoc-cn/wiki/pg11',
      {timeout: 30000},
    );
    const html = res.data;
    return html;
  } catch {
    return '';
  }
};

const text = ($tds, n) => {
  return $tds
    .eq(n)
    .text()
    .trim();
};
const int = ($tds, n) => {
  return parseInt(text($tds, n), 10);
};

const datasetFromHtml = html => {
  const $ = cheerio.load(html);
  const dataset = $('#wiki-body tbody tr')
    .map((i, el) => {
      const $tds = $(el).find('td');
      const am = int($tds, 2);
      const del = int($tds, 3);
      const state = text($tds, 4);
      return {
        am,
        del,
        state,
      };
    })
    .get();
  dataset.pop();
  return dataset;
};

const getDataset = async () => {
  const html = await getHtml();
  if (!html) return [];
  const dataset = datasetFromHtml(html);
  return dataset;
};

// 合计 a&m del 总数
const sum = dataset => {
  return dataset.reduce((s, v) => {
    return s + v.am + v.del;
  }, 0);
};

// 根据数据进行统计
const calc = dataset => {
  const sumAll = sum(dataset);
  const states = dataset.reduce((states, v) => {
    if (states.includes(v.state)) {
      return states;
    }
    states.push(v.state);
    return states;
  }, []);
  const sumStates = states.map(state => {
    const filtered = dataset.filter(v => v.state == state);
    const number = sum(filtered);
    return {
      state,
      number,
    };
  });
  let percents = {};
  let numbers = {};
  sumStates.forEach(v => {
    percents[v.state] = (v.number / sumAll) * 100;
    numbers[v.state] = v.number;
  });
  return {
    sumAll,
    sumStates,
    numbers,
    percents,
  };
};

// 更新全局变量
const updateDataset = async () => {
  dataset = await getDataset();
  if (!dataset.length) return;
  analysis = calc(dataset);
  lastupdate = litdate().format('Y-m-d H:i:s') + '(GMT+08:00)';
  fs.writeFile(
    'analysis.log',
    JSON.stringify({
      data: analysis,
      time: litdate().format('Y-m-d H:i:s'),
    }),
    {
      encoding: 'utf8',
      flag: 'a',
    },
    () => {},
  );
};

// 立即同步，然后每小时同步一次
updateDataset();
setInterval(updateDataset, 60 * 60 * 1000);

app.get('/', (req, res) => {
  res.render('index', {
    ...analysis,
    states: [
      {
        state: '待翻译',
        color: 'rgb(255,59,48)',
      },
      {
        state: '翻译中',
        color: 'rgb(255,149,0)',
      },
      {
        state: '已合并',
        color: 'rgb(255,204,0)',
      },
      {
        state: '完成',
        color: 'rgb(52,199,89)',
      },
    ],
    lastupdate,
  });
});

app.listen(3000);
