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
}

// Chart component creator, stringArray, axisColour, textColour, barColour are optional 
export default function Chart({ intArray, stringArray = [], axisColour = "black", textColour = "black", barColour="black"}: ChartProp) {
    
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

    const x0 = 50;
    const xAxisLength = chartWidth - x0 * 2;

    const y0 = 50;
    const yAxisLength = chartHeight - y0 * 2;

    const xAxisY = y0 + yAxisLength;

    const dataYMax = data.reduce(
        (currMax, [_, dataY]) => Math.max(currMax, dataY),
        -Infinity
    );
    const dataYMin = data.reduce(
        (currMin, [_, dataY]) => Math.min(currMin, dataY),
        Infinity
    );
    const dataYRange = dataYMax - dataYMin;

    const numYTicks = 5;

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
            <text fill={textColour} x={x0 + xAxisLength + 5} y={xAxisY + 4}>
                X
            </text>

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
                        <text fill={textColour} x={x0 - 5} y={y + 5} textAnchor="end">
                            {yLabel}
                        </text>
                    </g>
                );
            })}
            <text fill={textColour} x={x0} y={y0 - 8} textAnchor="middle">
                Y
            </text>

            {/* bar implementation, with animation implementation */}
            {data.map(([day, dataY], index) => {
                const x = x0 + index * barPlotWidth;

                const yRatio = (dataY - dataYMin) / dataYRange;

                const y = y0 + (1 - yRatio) * yAxisLength;
                const height = yRatio * yAxisLength;

                const sidePadding = 10;

                return (
                    <g key={index}>
                        <rect x={x + sidePadding / 2}
                            fill={barColour}
                            y={50}
                            width={barPlotWidth - sidePadding}
                            height={height}
                            transform={`scale(1,-1) translate(0,-${chartHeight})`}
                            >
                            <title>{dataY}</title>
                            <animate attributeName="height" from="0" to={height} dur="1s" fill="freeze" />
                        </rect>
                        <text fill={textColour} x={x + barPlotWidth / 2} y={xAxisY + 16} textAnchor="middle">
                            {day}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
}
