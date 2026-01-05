import { toPng } from 'html-to-image';

export const useDownloadImage = () => {
  const downloadAsPng = (image, downloadFileName) => {
    const element = image;

    if (!element) {
      console.error(`Element not found.`);
      return;
    }

    toPng(element)
      .then((dataUrl) => {
        // Erstelle ein unsichtbares Link-Element zum Herunterladen
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `${downloadFileName}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch((err) => {
        console.error('Failed to generate PNG:', err);
      });
  };

  return {
    downloadAsPng,
  };
};
