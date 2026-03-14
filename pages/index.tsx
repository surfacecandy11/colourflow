import type { NextPage } from 'next';
import Head from 'next/head';
import ColorPaletteTool from '@/components/ColorPaletteTool';

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>ColourFlow — Colour Palette Generator</title>
        <meta name="description" content="A standalone colour palette generator with 7 tabs, image extraction, vision simulation, and 5 export formats." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ColorPaletteTool />
    </>
  );
};

export default Home;
