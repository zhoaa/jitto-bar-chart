import React from 'react';
import { useState, useEffect } from 'react';


// getting window dimensions for use in resizing
function getWindowDimensions() {
    const { innerWidth: width, innerHeight: height } = window;
    return {
        width,
        height
    };
}

// resizing function
function useWindowDimensions() {
    const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());

    useEffect(() => {
        function handleResize() {
            setWindowDimensions(getWindowDimensions());
        }

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return windowDimensions;
}

interface ChartProp {
    intArray: number[];
    stringArray?: string[];
    axisColour?: string;
    textColour?: string;
    barColour?: string;
    selectColour?: string;
}

/**
 * Component for showing a bar chart based on props
 *
 * @component
 * @param number [] intArray An array of numbers that the bar chart represents, from left to right.
 * @param string [] stringArray An array of strings that represent each label for the bars, again going left to right. If no stringArray is provided, the X-axis is left unlabelled
 * @param string axisColour The colour of the axes. This is black if not given.
 * @param string textColour The colour of the text on the bar chart. This defaults to black if not given.
 * @param string barColour This is the colour of the bars of the bar chart. This defaults to black if not given.
 * @param string selectColour This is the colour the bars changed to if highlighted. This defaults to white if not given.
 */
export default function Chart({ intArray, stringArray = [], axisColour = "black", textColour = "black", barColour="black", selectColour="white"}: ChartProp) {
    
    // data conversion to form that's easier to work with
    let data: [string, number][] = [];
    if (stringArray.length === 0) {
        for (let i = 0; i < intArray.length; i++) {
            data.push(["", intArray[i]])
        }
    } else {
        for (let i = 0; i < intArray.length; i++) {
            data.push([stringArray[i], intArray[i]]);
        }
    }
    const { height: chartHeight, width: chartWidth } = useWindowDimensions();
    const [tooltipStates, setTooltipStates] = useState(intArray.map(_i => false));

    const x0 = 50;
    const xAxisLength = chartWidth - x0 * 2;

    const y0 = 50;
    const yAxisLength = chartHeight - y0 * 2;

    const xAxisY = y0 + yAxisLength;

    const dataYMax = data.reduce(
        (currMax, [_, dataY]) => Math.max(currMax, dataY),
        -Infinity
    );
    const dataYRange = dataYMax;

    const numYTicks = dataYMax*2;

    const barPlotWidth = xAxisLength / data.length;

    // return component, draw everything with lines and 
    return (
        <svg width={chartWidth} height={chartHeight}>
            {/* X axis */}
            <line
                x1={x0}
                y1={xAxisY}
                x2={x0 + xAxisLength}
                y2={xAxisY}
                stroke={axisColour}
            />

            {/* Y axis */}
            <line x1={x0} y1={y0} x2={x0} y2={y0 + yAxisLength} stroke={axisColour} />
            {Array.from({ length: numYTicks }).map((_, index) => {
                const y = y0 + index * (yAxisLength / numYTicks);

                const yValue = dataYMax - index * (dataYRange / numYTicks);
                // Round to 2 decimals
                const yLabel = Math.round((yValue + Number.EPSILON) * 100) / 100;

                return (
                    <g key={index}>
                        <line x1={x0} y1={y} x2={x0 - 5} y2={y} stroke={axisColour} />
                        <text fontFamily="Courier" fill={textColour} x={x0 - 5} y={y + 5} textAnchor="end">
                            {yLabel}
                        </text>
                    </g>
                );
            })}

            {/* bar implementation, with animation implementation */}
            {data.map(([day, dataY], index) => {
                const x = x0 + index * barPlotWidth;

                const yRatio = (dataY) / dataYRange;

                const y = y0 + (1 - yRatio) * yAxisLength;
                const height = yRatio * yAxisLength;

                const sidePadding = 10;

                const shouldShowTooltip = tooltipStates[index];

                const setShouldShowTooltip = (shouldShow: boolean) => {
                    const nextTooltipStates = tooltipStates.map((t, i) => {
                        if (i === index) {
                            return shouldShow;
                        }
                        return false;
                    })
                    setTooltipStates(nextTooltipStates);
                }

                return (
                    <g key={index}
                        onMouseOver={() => setShouldShowTooltip(true)}
                        onMouseLeave={() => setShouldShowTooltip(false)}>
                        <text fontFamily="Courier" fill={textColour} x={x + barPlotWidth / 2} y={height > 0 ? y - 16 : yAxisLength + y0 - 16}
                            textAnchor="middle"
                            display={shouldShowTooltip ? "" : "none"}>
                            {dataY}
                            
                        </text>
                        {
                            height > 0 ? (<rect x={x + sidePadding / 2}
                                y={50}
                                width={barPlotWidth - sidePadding}
                                height={height}
                                fill={shouldShowTooltip ? selectColour : barColour}
                                transform={`scale(1,-1) translate(0,-${chartHeight})`}>
                                <animate attributeName="height" from="0" to={height} dur="1s"/>
                            </rect>) : (<rect x={x + sidePadding / 2}
                                y={50}
                                width={barPlotWidth - sidePadding}
                                height={yAxisLength}
                                fill="transparent"
                                transform={`scale(1,-1) translate(0,-${chartHeight})`}>
                            </rect>)
                        }
                        <text fontFamily="Courier" fill={textColour} x={x + barPlotWidth / 2} y={xAxisY + 16} textAnchor="middle">
                            {day}
                        </text>
                        <title>{dataY}</title>
                    </g>
                );
            })}
        </svg>
    );
}
