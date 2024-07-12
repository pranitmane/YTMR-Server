const { execSync } = require('child_process');
const os = require('os');

export default function setSystemVolume(volume:number) {
  // Ensure volume is between 0 and 100
  volume = Math.max(0, Math.min(100, volume));

  const platform = os.platform();

  try {
    switch (platform) {
      case 'darwin': // macOS
        execSync(`osascript -e "set volume output volume ${volume}"`);
        console.log(`macOS volume set to ${volume}%`);
        break;

      case 'win32': // Windows
        const windowsVolume = Math.round((65535 * volume) / 100);
        execSync(`nircmd.exe setsysvolume ${windowsVolume}`);
        console.log(`Windows volume set to ${volume}%`);
        break;

      case 'linux': // Linux
        try {
          // Try PulseAudio first
          execSync(`pactl set-sink-volume @DEFAULT_SINK@ ${volume}%`);
          console.log(`Linux volume set to ${volume}% using PulseAudio`);
        } catch (error) {
          // If PulseAudio fails, try ALSA
          execSync(`amixer -q sset Master ${volume}%`);
          console.log(`Linux volume set to ${volume}% using ALSA`);
        }
        break;

      default:
        throw new Error(`Unsupported operating system: ${platform}`);
    }
  } catch (error:any) {
    console.error(`Error setting volume on ${platform}:`, error.message);
  }
}