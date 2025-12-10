import React, { useState } from "react";
// TODO: Migrate to recharts
// import { ResponsivePie } from "@nivo/pie";
// import { ResponsiveRadar } from "@nivo/radar";

const HomophoneCharts = () => {
    const [tooltip, setTooltip] = useState({
        show: false,
        text: "",
        x: 0,
        y: 0,
    });

    const metrics = [
        { name: "Accuracy", value: 82 },
        { name: "Incorrect", value: 75 },
        { name: "Missing", value: 68 },
        { name: "Pause Count", value: 74 },
        { name: "Avg Time", value: 80 },
    ];

    // Nivo Radar expects array of objects for each "series".
    const radarData = metrics.map((metric) => ({
        metric: metric.name,
        "Current Week": metric.value,
    }));

    const data = [
        {
            id: "incorrect",
            label: "Incorrect",
            value: 544,
            color: "hsl(232, 70%, 50%)",
        },
        {
            id: "missing",
            label: "Missing",
            value: 167,
            color: "hsl(121, 70%, 50%)",
        },
        {
            id: "correct",
            label: "Correct",
            value: 289,
            color: "hsl(245, 70%, 50%)",
        },
        {
            id: "extra",
            label: "Extra",
            value: 345,
            color: "hsl(314, 70%, 50%)",
        },
    ];

    const hideTooltip = () => setTooltip({ ...tooltip, show: false });

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* === Radar Chart === */}
            <div className="relative bg-white rounded-2xl shadow-sm border border-gray-100 w-full h-[65vh] p-6 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">
                            Homophone Performance Radar
                        </h2>
                        <p className="text-sm text-gray-500">
                            Comparison across accuracy metrics
                        </p>
                    </div>
                </div>

                {/* Radar Chart */}
                <div className="flex-1">
                    <ResponsiveRadar
                        data={radarData}
                        keys={["Current Week"]}
                        indexBy="metric"
                        maxValue={100} // since values are percentages
                        margin={{ top: 20, right: 80, bottom: 30, left: 80 }}
                        curve="linearClosed"
                        borderWidth={2}
                        borderColor="#93c5fd" // blue-300 border
                        gridLevels={5}
                        gridShape="circular"
                        gridLabelOffset={16}
                        enableDots={true}
                        dotSize={6}
                        dotColor="#93c5fd" // blue-300 dots
                        dotBorderWidth={2}
                        dotBorderColor="#2563eb" // blue-600 border for contrast
                        enableDotLabel={true}
                        dotLabel="value"
                        dotLabelYOffset={-12}
                        colors={["#93c5fd"]} // blue-300 fill
                        fillOpacity={0.6} // adjust transparency
                        blendMode="multiply"
                        animate={true}
                        motionConfig="wobbly"
                        legends={[
                            {
                                anchor: "bottom",
                                direction: "row",
                                translateX: 0,
                                translateY: 40,
                                itemWidth: 100,
                                itemHeight: 18,
                                itemTextColor: "#4B5563",
                                symbolSize: 18,
                                symbolShape: "circle",
                            },
                        ]}
                    />
                </div>
            </div>

            {/* === Donut Chart === */}
            <div className="relative bg-white rounded-2xl shadow-md border border-gray-100 w-full h-[65vh] p-6 flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">
                            Overall Articles Accuracy
                        </h2>
                        <p className="text-sm text-gray-500">
                            Comparison of detected mistake types
                        </p>
                    </div>
                </div>

                {/* Donut Chart */}
                <div className="flex flex-col items-center justify-center flex-1">
                    <div className="w-full h-[400px]">
                        <ResponsivePie
                            data={data}
                            margin={{
                                top: 40,
                                right: 80,
                                bottom: 80,
                                left: 80,
                            }}
                            innerRadius={0.5} // donut shape
                            padAngle={0.6}
                            cornerRadius={3}
                            activeOuterRadiusOffset={8}
                            arcLinkLabelsSkipAngle={10}
                            arcLinkLabelsTextColor="#333333"
                            arcLinkLabelsThickness={2}
                            arcLinkLabelsColor="#93c5fd"
                            arcLabelsSkipAngle={10}
                            arcLabelsTextColor={{
                                from: "color",
                                modifiers: [["darker", 2]],
                            }}
                            legends={[
                                {
                                    anchor: "bottom",
                                    direction: "row",
                                    justify: false,
                                    translateX: 0,
                                    translateY: 56,
                                    itemsSpacing: 10,
                                    itemWidth: 100,
                                    itemHeight: 18,
                                    itemTextColor: "#4B5563", // gray-700
                                    symbolSize: 18,
                                    symbolShape: "circle",
                                },
                            ]}
                        />
                    </div>
                    {/* Center label */}
                    <div className="absolute flex -mt-12 flex-col items-center justify-center pointer-events-none">
                        <span className="text-2xl font-bold text-gray-800">
                            100%
                        </span>
                        <span className="text-xs text-gray-500 font-medium tracking-wide">
                            Overall Accuracy
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomophoneCharts;
