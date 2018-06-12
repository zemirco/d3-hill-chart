import { select, event } from 'd3-selection'
import { scaleLinear } from 'd3-scale'
import { axisBottom, axisLeft } from 'd3-axis'
import { line } from 'd3-shape'
import { drag } from 'd3-drag'
import { range } from 'd3-array'

const defaults = {
  width: 1000,
  height: 300,
  margin: {
    top: 15,
    right: 200,
    bottom: 35,
    left: 60
  }
}

export default class HillChart {
  constructor(config) {
    Object.assign(this, defaults, config)
    this.init()
  }

  init() {
    const { width, height, margin, target } = this

    const w = width - margin.left - margin.right
    const h = height - margin.top - margin.bottom

    this.svg = select(target)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`)

    this.xScale = scaleLinear()
      .domain([0, 100])
      .range([0, w])

    this.xAxis = axisBottom(this.xScale).ticks(0)

    this.svg
      .append('g')
      .attr('class', 'x axis')
      .attr('transform', `translate(0, ${h})`)
      .call(this.xAxis)

    this.yScale = scaleLinear()
      .domain([0, 100])
      .range([h, 0])

    this.yAxis = axisLeft(this.yScale).ticks(0)

    this.svg
      .append('g')
      .attr('class', 'y axis')
      .call(this.yAxis)

    const fn = x => 50 * Math.sin((Math.PI / 50) * x - (1 / 2) * Math.PI) + 50
    const lineData = range(0, 100, 0.1).map(i => ({
      x: i,
      y: fn(i)
    }))

    this.line = line()
      .x(d => this.xScale(d.x))
      .y(d => this.yScale(d.y))

    this.svg
      .append('path')
      .attr('class', 'line')
      .datum(lineData)
      .attr('d', this.line)

    const data = [
      { color: 'orange', desc: 'Notification: Hey menu', x: 10, y: fn(10) },
      { color: 'red', desc: 'Notification: Email', x: 40, y: fn(40) },
      { color: 'blue', desc: 'Notification: Delivery', x: 70, y: fn(70) }
    ]

    const that = this

    const dragIt = drag().on('drag', function(d) {
      let x = event.x
      if (x < 0) {
        x = 0
      } else if (x > w) {
        x = w
      }
      const inverted = that.xScale.invert(x)
      d.x = x
      d.y = that.yScale(fn(inverted))
      select(this).attr('transform', `translate(${d.x}, ${d.y})`)
    })

    const group = this.svg
      .selectAll('.group')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'group')
      .attr('transform', d => {
        d.x = this.xScale(d.x)
        d.y = this.yScale(d.y)
        return `translate(${d.x}, ${d.y})`
      })
      .call(dragIt)

    group
      .append('circle')
      .attr('fill', d => d.color)
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', 8)

    group
      .append('text')
      .text(d => d.desc)
      .attr('x', 10)
      .attr('y', 5)

    this.svg
      .append('line')
      .attr('class', 'middle')
      .attr('x1', this.xScale(50))
      .attr('y1', this.yScale(0))
      .attr('x2', this.xScale(50))
      .attr('y2', this.yScale(100))

    this.svg
      .append('text')
      .attr('class', 'text')
      .text('Figuring things out')
      .attr('x', this.xScale(25))
      .attr('y', h + 25)

    this.svg
      .append('text')
      .attr('class', 'text')
      .text('Making it happen')
      .attr('x', this.xScale(75))
      .attr('y', h + 25)
  }
}
