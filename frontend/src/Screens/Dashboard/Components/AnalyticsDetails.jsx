import React from 'react';
import { engagments, insights } from '../../../Utils/DummyData';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const AnalyticsDetails = ({ selected }) => {
    const data = {
        labels: ['Followers', 'Non Followers'],
        datasets: [
            {
                label: '# of Votes',
                data: [50.3, 50.3],
                backgroundColor: ['#042EFE', '#048EFE'],
                borderColor: ['#fff'],
                borderWidth: 2,
            },
        ],
    };

    return (
        <div className="p-8 rounded-xl shadow-lg bg-whiteColor ">
            <div className="grid grid-cols-1 md:grid-cols-2 items-start gap-10">
                {/* Analytics Text */}
                <div className='md:w-[80%]' >
                    <h2 className="preheading font-semibold">Insights</h2>
                    <div className="space-y-6 mt-4">
                        {selected === "User Engagement" ?
                            engagments.map((insight) => (
                                <div key={insight.qyt} className="flex justify-between text10">
                                    <p className="flex-1 break-words">{insight.title}</p>
                                    <div>
                                        <div className="flex flex-col items-end gap-1">
                                            <p className="text10">{insight.qyt}</p>
                                            <p className="text-lightblueColor text11">{insight.percent}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                            :
                            insights.map((insight) => (
                                <div key={insight.qyt} className="flex justify-between text10">
                                    <p className="flex-1 break-words">{insight.title}</p>
                                    <div>
                                        <div className="flex flex-col items-end gap-1">
                                            <p className="text10">{insight.qyt}</p>
                                            <p className="text-lightblueColor text11">{insight.percent}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        }
                    </div>

                </div>

                {/* Analytics Graph */}
                <div className='rounded-lg p-8 bg-whiteColor shadow-[0px_0px_4px_2px_rgba(80,80,80,0.20)]'>
                    {
                        selected === "User Engagement" ?
                            <div className='text-center'>
                                <span className='text9 font-semibold text-center'>1000</span>
                                <p className='text8'>User Engagment</p>
                            </div>
                            :
                            <div className='text-center'>
                                <span className='text9 font-semibold'>1000</span>
                                <p className='text8'>Users Followers</p>
                            </div>
                    }

                    <div className="flex flex-col xl:flex-row justify-around gap-2 items-center md:mt-10 mt-4">

                        <div className="mb-6 md:mb-0 text-center">
                            <span className='text8 font-semibold'>50.3%</span>
                            <div className='flex items-center gap-2'>
                                {
                                    selected === "User Engagement" ?
                                        <p className='text10'>Likes</p>
                                        :
                                        <p className='text10'>Followers</p>
                                }
                                <div className='md:p-2 p-1 rounded-full bg-lightblueColor'></div>
                            </div>
                        </div>

                        <div className="w-[90%] max-w-[400px] md:w-[200px]">
                            <Doughnut
                                data={data}
                                options={{
                                    maintainAspectRatio: false,
                                    plugins: { legend: { display: false } },
                                    responsive: true,
                                }}
                            />
                        </div>

                        <div className="mb-6 md:mb-0 text-center">
                            <span className='text8 font-semibold'>50.3%</span>
                            <div className='flex items-center gap-2'>

                                {
                                    selected === "User Engagement" ?
                                        <p className='text10'>Comments</p>
                                        :
                                        <p className='text10'>Non Followers</p>
                                }
                                <div className='md:p-2 p-1 rounded-full bg-blueColor'></div>
                            </div>
                        </div>

                    </div>

                    <div className='py-4'>
                        <div className='bg-gray w-full p-[1px]'></div>
                    </div>

                    <div className='flex flex-col md:flex-row items-center justify-between'>
                        <p className='text9 font-semibold'>Impressions</p>
                        <div className='text-end'>
                            <p className='text10 font-semibold'>1,890</p>
                            <p className='text-pink text10 '>+18.3%</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AnalyticsDetails;
