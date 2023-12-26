import { NextResponse, NextRequest } from 'next/server';
export const maxDuration = 100; // This function can run for a maximum of 100 seconds
export const dynamic = 'force-dynamic';



const texttoimageURL = "https://api.segmind.com/v1/sdxl1.0-txt2img";
const texttoimageAPIKEY = process.env.SEGMIND_API_KEY;

const chat_gpt3_url = "https://api.openai.com/v1/chat/completions"
const gpt3_headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
}



export const POST = async (req: NextRequest, res: Response) => {

    const { text, style, imagecount } = await req.json();
    console.log("text: ", text);
    console.log("style: ", style);
    console.log("imagecount: ", imagecount);


    async function fetchIllustratorPrompts(prompt) {
        // let retries = 0;
        let currentAttempt = 0;
        const maxRetryAttempts = 3;
        let success = false;

        while (currentAttempt < maxRetryAttempts && !success) {

            try {
                // Define the payload for the chat model
                const messages = [
                    {
                        role: "system",
                        content:
                            "You are an expert author who can read children's stories and create short briefs for an illustrator, providing specific instructions, ideas, or guidelines for the illustrations you want them to create.",
                    },
                    { role: "user", content: prompt },
                ];

                const chatgptPayload = {
                    model: "gpt-3.5-turbo-16k",
                    messages: messages,
                    temperature: 1.3,
                    max_tokens: 2000,
                    top_p: 1,
                    stop: ["###"],
                };




                const response = await fetch(chat_gpt3_url, {
                    headers: gpt3_headers,
                    method: "POST",
                    body: JSON.stringify(chatgptPayload),
                    cache: 'no-cache'
                });

                // console.log("responseJson ",await response.json());

                if (!response.ok) throw new Error("GPT-3 API fetch error");

                const responseJson = await response.json();

                console.log("responseJson ", responseJson)
                console.log("message choices ",responseJson.choices[0].message.content.trim())

                const output = JSON.parse(
                    responseJson.choices[0].message.content.trim()
                );

                success = true;

                return output;

            } catch (err) {
                currentAttempt++;
                console.log(`Error on retry ${currentAttempt} parsing response or fetching data: `, err);
                if (currentAttempt === maxRetryAttempts) {
                    console.log("Max retries reached");
                    return null;
                }
            }
        }
        // If max retries are reached without a successful response, return null
        return null;
    }


    function generatePrompt(text, count) {
        const promptPrefix = `${JSON.stringify(text)}
  
  ------------------------------------
  
  Generate ${count} short briefs as a list from the above story to give as input to an illustrator to generate relevant children's story illustrations.
  
  Strictly add no common prefix to briefs. Strictly generate each brief as a single sentence that contains all the necessary information.
  
  Strictly output your response in a JSON list format, adhering to the following sample structure:`;

        const sampleOutput = { illustrations: Array(count).fill("...") };

        const promptPostinstruction = `\nOutput:`;

        return (
            promptPrefix + JSON.stringify(sampleOutput) + promptPostinstruction
        );
    }

    const prompt = generatePrompt(text, imagecount);


    try {

        const illustratorPrompts = await fetchIllustratorPrompts(prompt);
        console.log("illustratorPrompts ", illustratorPrompts)

        if (!illustratorPrompts || !illustratorPrompts.illustrations) {
            throw new Error('Failed to fetch illustrator prompts');
        }

        const images = [];
        for (const illustrationText of illustratorPrompts.illustrations) {
            // Generate a random seed between 400000 and 500000
            const randomSeed = Math.floor(Math.random() * (500000 - 400000 + 1)) + 400000;
            const requestBody = {
                prompt: illustrationText,
                negative_prompt: "ugly, tiling, poorly drawn hands, poorly drawn feet, poorly drawn face, out of frame, extra limbs, disfigured, deformed, body out of frame, blurry, bad anatomy, blurred, watermark, grainy, signature, cut off, draft",
                style: style,
                samples: 1,
                scheduler: "UniPC",
                num_inference_steps: 25,
                guidance_scale: 8,
                strength: 0.2,
                high_noise_fraction: 0.8,
                // seed: "468685",
                seed: randomSeed,
                img_width: 1024,
                img_height: 1024,
                refiner: true,
                base64: true,
            };

            console.log(requestBody)

            const response = await fetch(texttoimageURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': texttoimageAPIKEY,
                },
                body: JSON.stringify(requestBody),
            });

            // console.log("response ",response);

            if (!response.ok) {
                throw new Error("Error with generating Illustrations");
            }

            // Assuming the response from the API is in image/jpeg format
            const responseData = await response.json();
            const base64Image = responseData.image;
            images.push(base64Image);
        }

        return NextResponse.json({ images: images }, { status: 200 });



    } catch (error) {
        console.error(error)
        return NextResponse.json({ "message": `ERROR: Could not generate images for the text` }, { status: 500 });
    }

}

