export const useDownloadMarkdown = () => {
  const downloadAsMarkdown = (content, fileName) => {
    if (!content) {
      console.error('No content provided for download.');
      return;
    }

    // Create a Blob from the markdown content
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });

    // Create a download URL
    const url = URL.createObjectURL(blob);

    // Create a temporary link element
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.md`;

    // Trigger download
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return {
    downloadAsMarkdown,
  };
};
