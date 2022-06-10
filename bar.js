// Copyright 2022 The Natural Design Authors. All rights reserved.
// Use of this source code is governed by a GPLv3 license that
// can be found in the LICENSE file.

// This file includes the implementation of the bar chart visualization.

// Color encoding being used:
// 9E0142 = Software and its Engineering
// E95C45 = Theory of Computation
// FDBF6E = Hardware
// AFA27D = Computer Systems Organization
// FDFFBE = Human-centered Computing
// BEE49F = Information Systems
// B2D3CD = Applied Computing
// 54ADAC = Computing Methodologies
// 5E4FA2 = Social and Professional Topics
// C189D3 = General and Reference
// D18B8B = Networks
const acm_ccs = [
  {name: 'Software and its Engineering',   color: '#9E0142'},
  {name: 'Theory of Computation',          color: '#E95C45'},
  {name: 'Hardware',                       color: '#FDBF6E'},
  {name: 'Computer Systems Organization',  color: '#AFA27D'},
  {name: 'Human-centered Computing',       color: '#E5E88F'},
  {name: 'Information Systems',            color: '#BEE49F'},
  {name: 'Applied Computing',              color: '#B2D3CD'},
  {name: 'Computing Methodologies',        color: '#54ADAC'},
  {name: 'Social and Professional Topics', color: '#5E4FA2'},
  {name: 'General and Reference',          color: '#C189D3'},
  {name: 'Networks',                       color: '#D18B8B'},
]

const year_begin = 1979
const year_end   = 2021

const ccs_names = []
const ccs_colors = []
for (const v of acm_ccs) {
  ccs_names.push(v.name)
  ccs_colors.push(v.color)
}

const year = []
for (let i = year_begin; i <= year_end; i++) {
 year.push(`${i}`)
}

const bar_series = []
const ccs_year_papers = {}

for (const v of acm_ccs) {
  const data_count = new Array(year_end-year_begin+1).fill(0)
  ccs_year_papers[v.name] = {}
  Object.values(references).forEach(vv => {
    if (vv.ccs === v.name) {
        data_count[vv.year-year_begin]++
        if (ccs_year_papers[v.name][vv.year] == null) {
          ccs_year_papers[v.name][vv.year] = []
        }
        ccs_year_papers[v.name][vv.year].push(vv)
    }
  })
  bar_series.push({
    type: 'bar',
    label: { show: true, position: 'insideRight' },
    name:  v.name,
    stack: 'total-paper',
    data: data_count,
    color: v.color,
    label: {
      show: false,
      margin: 0,
    },
  })
}

function computePieData(yearmin, yearmax) {
  let pie_data = {
    'Software and its Engineering':   { name: 'Software and its Engineering',   value: 0 },
    'Theory of Computation':          { name: 'Theory of Computation',          value: 0 },
    'Hardware':                       { name: 'Hardware',                       value: 0 },
    'Computer Systems Organization':  { name: 'Computer Systems Organization',  value: 0 },
    'Human-centered Computing':       { name: 'Human-centered Computing',       value: 0 },
    'Information Systems':            { name: 'Information Systems',            value: 0 },
    'Applied Computing':              { name: 'Applied Computing',              value: 0 },
    'Computing Methodologies':        { name: 'Computing Methodologies',        value: 0 },
    'Social and Professional Topics': { name: 'Social and Professional Topics', value: 0 },
    'General and Reference':          { name: 'General and Reference',          value: 0 },
    'Networks':                       { name: 'Networks',                       value: 0 },
  }
  Object.values(references).forEach(v => {
    if (v.year >= yearmin && v.year <= yearmax && v.ccs) {
      pie_data[v.ccs].value++
    }
  })
  return Object.values(pie_data)
}

function computeFinalSeries(yearmin, yearmax) {
  let final_fig_series = []
  final_fig_series.push({
    type: 'pie',
    stillShowZeroSum: false,
    label: { show: false },
    color: ccs_colors,
    radius: [0, '30%'],
    center: ['85%', '50%'],
    data: computePieData(yearmin, yearmax),
  })
  final_fig_series.push({
    type: 'pie',
    stillShowZeroSum: false,
    label: {
      position: 'inside',
      alignTo: 'edge',
      formatter: '{c}',
      color: '#fff'
    },
    color: ccs_colors,
    radius: ['20%', '30%'],
    center: ['85%', '50%'],
    data: computePieData(yearmin, yearmax)
  })
  return final_fig_series.concat(bar_series)
}

function computeOptions(yearmin, yearmax) {
  return {
    tooltip: {
      trigger: 'item',
      triggerOn: 'click',
    },
    title: [{
      text: 'a) DISTRIBUTION OF PAPERS ON NATURAL DESIGN', // a) YEAR GROWTH OF PAPERS ON NATURAL DESIGN
      left: '40%',
      textAlign: 'center'
    }, {
      text: 'b) ACM CCS', // b) ACM CCS CLUSTERS
      left: '85%',
      textAlign: 'center'
    }],
    dataZoom: { show: false },
    legend: {
      show: false,
    },
    grid: [{
        top: '10%',
        width: '60%',
    }],
    yAxis: {
      type: 'value',
      min: 0,
      max: 10,
      interval: 1,
    },
    xAxis: {
      type: 'category',
      data: year,
      splitLine: {
        show: true,
        interval: 0,
      },
    },
    series: computeFinalSeries(yearmin, yearmax),
  }
}

const barFig = echarts.init(document.getElementById('bar-fig'))
barFig.setOption(computeOptions(year_begin, year_end))
barFig.on('click', params => {
  const refs = []
  if (params.componentSubType === 'bar') {
    ccs_year_papers[params.seriesName][params.name].forEach(v => refs.push(v.section))
  }
  if (params.componentSubType === 'pie') {
    Object.values(ccs_year_papers[params.name]).forEach(v => v.forEach(vv => refs.push(vv.section)))
  }
  if ($('#bar-reference').length > 0) {
    $('#bar-reference').remove()
  }
  if (refs.length > 0) {
    $('#bar').append($('<div/>', {
      id: 'bar-reference',
      class: 'reference',
    }))
    refs.forEach(ref => {
      $('#bar-reference').append($(`<p>${ref}</p>`))
    })
    return
  }
  $('#bar-reference').remove() // if nothing is selected, then delete!
})

// for year slider
function year2percent(year) { return (year-year_begin)*100/(year_end-year_begin) }
$('#slider-year').slider({
  range: true,
  min: year_begin,
  max: year_end,
  step: 1,
  values: [year_begin, year_end],
  slide: (event, ui) => { // HACK: need map between -3%-97%
    if (ui.values[1] - ui.values[0] < 0) {
      return false
    }
    $('#year-label-left').css('left', `${year2percent(ui.values[0])-3}%`).text(ui.values[0])
    $('#year-label-right').css('left', `${year2percent(ui.values[1])-3 }%`).text(ui.values[1]);
    barFig.setOption(computeOptions(ui.values[0], ui.values[1]))
    barFig.dispatchAction({
      type: 'dataZoom',
      start: year2percent(ui.values[0]),
      end: year2percent(ui.values[1]),
    })
 },
  create: (event, ui) => {
    $('#year-label-left').css('left', '-3%').text(`${year_begin}`);
    $('#year-label-right').css('left', '97%').text(`${year_end}`);
  }
}).trigger('slide')

ccs_names.forEach((name, idx) => { // for ccs buttons
  $('#acm-ccs').append(
    // a ccs category button
    $('<div/>', {
      'text': name,
      'class': 'button noselect',
      'style': `
        border: 2px solid ${ccs_colors[idx]};
      `
    }).hover(function() {
      if ($(this).hasClass('button-deactivate')) {
        $(this).css('background-color', '#b4b4b4')
        $(this).css('color', 'white')
      }
      else {
        $(this).css('color', 'white')
        $(this).css('background-color', ccs_colors[idx])
      }
    }).mouseout(function() {
      if ($(this).hasClass('button-deactivate')) {
        $(this).css('background-color', 'white')
        $(this).css('color', '#b4b4b4')
      }
      else {
        $(this).css('color', 'black')
        $(this).css('background-color', 'white')
      }
    }).click(function() {
      if ($(this).hasClass('button-deactivate')) {
        $(this).removeClass('button-deactivate')
        $(this).css('background-color', ccs_colors[idx])
        $(this).css('border', `2px solid ${ccs_colors[idx]}`)
      } else {
        $(this).addClass('button-deactivate')
        $(this).css('background-color', '#b4b4b4')
        $(this).css('border', `2px solid #b4b4b4`)
      }
      barFig.dispatchAction({
        type: 'legendToggleSelect',
        name: name,
      })
    })
  )
})