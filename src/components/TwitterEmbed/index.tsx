import { useState, useEffect } from 'react';

interface TwitterEmbedProps {
  tweetUrl: string;
}

const TwitterEmbed: React.FC<TwitterEmbedProps> = ({ tweetUrl }) => {
  const [embedHtml, setEmbedHtml] = useState<string | null>(null);

  useEffect(() => {
    // 发送请求到 Twitter oEmbed API
    fetch(`https://publish.twitter.com/oembed?url=${encodeURIComponent(tweetUrl)}`)
      .then((res) => res.json())
      .then((data) => {
        setEmbedHtml(data.html);
      })
      .catch((error) => {
        console.error('Error fetching oEmbed tweet:', error);
      });
  }, [tweetUrl]);

  return (
    <div className="twitter-embed-container">
      {embedHtml ? (
        <div dangerouslySetInnerHTML={{ __html: embedHtml }} />
      ) : (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-400">Loading Tweet...</span>
        </div>
      )}
    </div>
  );
};

export default TwitterEmbed; 