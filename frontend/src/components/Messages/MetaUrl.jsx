import React, { useEffect, useState } from 'react'
import axios from 'axios'
const MetaUrl = ({ url }) => {
    const [content, setContent] = useState(null)
    const getMetaContent = async () => {
        try {
            const { data } = await axios.get(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`)

            if (!data?.title) return;

            setContent({
                title: data.title,
                thumbnail: data.thumbnail_url,
                author: data.author_name,
                width: data.width,
                height: data.height
            })
        } catch (error) {
            console.log(error);

        }
        
    }
    useEffect(() => {
        getMetaContent()
    }, [url])

    if (!content) return null;

    return (
    <div className="max-w-[70vw] md:max-w-[40vw] rounded-md border-l-4 border-l-sky-600 bg-slate-900 p-3 space-y-2 mt-2 mx-3">
        <h3 className="text-sky-400 text-sm font-semibold">YouTube</h3>

        <p className="text-white text-sm font-medium line-clamp-2">
            {content.title}
        </p>

        <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
            <img
                loading="lazy"
                src={content.thumbnail}
                alt={content.title}
                className="h-full w-full object-cover"
            />
        </div>
    </div>
);

}

export default MetaUrl