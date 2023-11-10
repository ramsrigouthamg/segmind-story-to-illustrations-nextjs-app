"use client";

import { useState,useEffect } from 'react';
import ReactLoading from 'react-loading';
// import Header from '@/components/Header'
import Image from 'next/image';
import DownloadIcon from '@mui/icons-material/GetApp';
import { Swiper, SwiperSlide } from 'swiper/react'
import { FreeMode, Navigation, Thumbs } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/free-mode'
import 'swiper/css/navigation'
import 'swiper/css/thumbs'

export const revalidate = 0;

export default function Home() {
  const [selectedOption, setSelectedOption] = useState('watercolor');
  const [isLoading, setIsLoading] = useState(false);



  const [textBoxValue, setTextBoxValue] = useState("Elon Musk has shown again he can influence the digital currency market with just his tweets. After saying that his electric vehicle-making company Tesla will not accept payments in Bitcoin because of environmental concerns, he tweeted that he was working with developers of Dogecoin to improve system transaction efficiency. \n\nFollowing the two distinct statements from him, the world's largest cryptocurrency hit a two-month low, while Dogecoin rallied by about 20 percent. The SpaceX CEO has in recent months often tweeted in support of Dogecoin, but rarely for Bitcoin.  In a recent tweet, Musk put out a statement from Tesla that it was concerned about the rapidly increasing use of fossil fuels for Bitcoin (price in India) mining and transaction, and hence was suspending vehicle purchases using the cryptocurrency. \n\nA day later he again tweeted saying, To be clear, I strongly believe in crypto, but it can't drive a massive increase in fossil fuel use, especially coal. It triggered a downward spiral for Bitcoin value but the cryptocurrency has stabilised since.  A number of Twitter users welcomed Musk's statement. One of them said it's time people started realising that Dogecoin is here to stay and another referred to Musk's previous assertion that crypto could become the world's future currency.");
  const [outputValue, setOutputValue] = useState(null);


  const [wordCount, setWordCount] = useState(0);
  const [submitting, setIsSubmitting] = useState(false);

  const [numImages, setNumImages] = useState(2);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);




  const handleNumImagesChange = (event) => {
    setNumImages(parseInt(event.target.value, 10));
  };

  const handleDownload = (imageIndex) => {
    // Fetch the image from the outputValue state using the index
    const base64Image = outputValue[imageIndex];
    // Create a link and set the URL using the base64Image data
    const link = document.createElement("a");
    link.href = `data:image/png;base64,${base64Image}`;
    link.download = `illustration-${imageIndex}.png`;
    // Append the link to the body, click it, and then remove it
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const DownloadButton = ({ onDownload, imageIndex }) => (
    <button
      onClick={() => onDownload(imageIndex)}
      className="absolute top-2 right-2 bg-gray-200 bg-opacity-50 rounded-full p-2 hover:bg-gray-400 transition duration-300 ease-in-out"
      aria-label="Download Image"
    >
      <DownloadIcon className="text-gray-600 hover:text-gray-800" /> {/* Use the MUI Icon */}
    </button>
  );

  const calculateWordCount = (text) => {
    const words = text.trim().split(/\s+/);
    return words.length;
  };

  useEffect(() => {
    const count = calculateWordCount(textBoxValue);
    setWordCount(count);
  }, []); // Empty dependency array to run the effect only once



  const handleChange = (event) => {
    setSelectedOption(event.target.value);
  };


  useEffect(() => {
    if (outputValue) {
      // setTotalCount(outputValue.length);
    }
  }, [outputValue]);

  const handleInputChange = (event) => {
    const inputValue = event.target.value;
    setTextBoxValue(inputValue);
    const count = calculateWordCount(inputValue);
    setWordCount(count);
  };


  const handleClick = async () => {

    console.log("entered handleclick")


    // Reset states
    setOutputValue(null);
    setIsSubmitting(false);

    // setTotalCount(0);

    setIsLoading(false);
    try {



      setIsLoading(true);

      var requestOptions = {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          "text": textBoxValue,
          "style": selectedOption,
          "imagecount": numImages
        }),
        cache: 'no-cache'
      };

      console.log("requestOptions ", requestOptions)

      const response = await fetch("/api/generate-story-illustrations", requestOptions);
      // console.log('response ',response);

      const newData = await response.json();
      console.log('newData ', newData);

      // Check if newData has a status property and if it's 429
      if (response && response.status === 429) {
        toast.error(newData.message);
        return; // Exit from the function
      }

      setOutputValue(newData.images);



    } catch (error) {
      setOutputValue("An error occurred, please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="
    bg-white-900 
    rounded-lg 
    h-full 
    w-full 
    overflow-hidden 
    overflow-y-auto
    p-4
    ml-8
    mr-8
  ">


<div className="flex flex-col items-center justify-center text-xl font-bold mb-4 text-black-500 md:text-2xl mr-4">
  Generate Storybook Illustrations for children's stories using AI. 
</div>

<div className="flex flex-col items-center justify-center text-l font-bold mb-4 text-black-500 md:text-xl mr-4">
  Use the dropdown selector to pick different illustration styles like Line Art, WaterColor, Comic Book etc
</div>

<div className="flex flex-col items-center justify-center text-md mb-4 text-black-500 md:text-lg mr-4">
  Generate HD images at a 1024 x 1024 pixel resolution, ready for commercial use.
</div>


        <div className="flex w-full">

          <div className="w-1/2 pr-2">


            <div className={`text-md text-black-500`}>
              Suggested text length: Upto 10,000 words. Supports English.
            </div>

            <div className={`text-sm font-semibold mb-2 ${wordCount >= 1 && wordCount <= 10000 ? 'text-green-700' : 'text-red-500'}`}>
              <br />
              Word Count: {wordCount}
            </div>

            <textarea
              className="w-full h-[35vh] p-2 border rounded"
              value={textBoxValue}
              onChange={handleInputChange}
            />

            <div className="w-full mt-2">
              <label htmlFor="Style" className="block text-sm font-medium text-gray-700">Illustration Style</label>
              <select
                id="Style"
                name="Style"
                className="w-full p-2 mt-2 border rounded"
                value={selectedOption}
                onChange={handleChange}
                style={{ maxWidth: '100%' }}
              >
                <option value="watercolor">Watercolor</option>
                <option value="comic book">Comic Book</option>
                <option value="line art">Line Art</option>
                <option value="kawaii">Kawaii</option>

              </select>
            </div>

            <div className="w-full mt-2">
              <label htmlFor="Style" className="block text-sm font-medium text-gray-700">Image Count</label>
              <select
                id="numImages"
                name="numImages"
                className="w-full p-2 mt-2 border rounded"
                value={numImages}
                onChange={handleNumImagesChange}
                style={{ maxWidth: '100%' }}
              >
                {[...Array(3).keys()].map((_, i) => (
                  <option key={i} value={i + 1}>
                    {i + 1}
                  </option>
                ))}

              </select>
            </div>

            <button
              className={`w-full mt-2 p-2 text-white rounded  'bg-green-500' }`}
              onClick={ 
                  handleClick
              }
              style={{
                backgroundColor: '#1a8a2a',
                cursor: 'pointer',
                opacity: '1',
              }}
            >
              Submit
            </button>




          </div>
          <div className="w-1/2 pl-2 relative overflow-y-auto">
            {isLoading && (
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <ReactLoading type="spin" color="#A9A9A9" />
              </div>
            )}



            {outputValue && (
              <div className="mt-8 mx-4">
                {/* Thumbnail */}
                <Swiper
                  onSwiper={setThumbsSwiper}
                  loop={true}
                  spaceBetween={12}
                  slidesPerView={4}
                  freeMode={true}
                  watchSlidesProgress={true}
                  modules={[FreeMode, Navigation, Thumbs]}
                  className='thumbs mt-3 h-32 w-full rounded-lg'
                >
                  {outputValue.map((base64Image, index) => (
                    <SwiperSlide key={index}>
                      <button className='flex h-full w-full items-center justify-center'>
                        <Image
                          src={`data:image/png;base64,${base64Image}`}
                          alt={`Generated Illustration ${index}`}
                          className='block h-full w-full object-cover'
                          width={120} // specify the width
                          height={120}

                        />
                      </button>
                    </SwiperSlide>
                  ))}
                </Swiper>

                <div className="mt-4" /> 

                <Swiper
                  loop={true}
                  spaceBetween={10}
                  navigation={true}
                  thumbs={{
                    swiper:
                      thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null
                  }}
                  modules={[FreeMode, Navigation, Thumbs]}
                  className='w-full rounded-lg'
                >
                  {outputValue.map((base64Image, index) => (
                    <SwiperSlide key={index}>

                      <div key={index} className="relative mb-4">
                        <img
                          src={`data:image/png;base64,${base64Image}`}
                          alt={`Generated Illustration ${index}`}
                          className="mb-4"
                          // width={512}
                          // height={512}
                        />
                        <DownloadButton onDownload={handleDownload} imageIndex={index} />
                      </div>
                    </SwiperSlide>
                  ))}

                </Swiper>


                </div>



            )}



          </div>
        </div>

    </div>
  )
}
