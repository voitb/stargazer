import { Box, Text, useInput } from 'ink';
import { useAppContext } from '../state/app-context.js';
import { gradientLine, useTheme } from '../theme/index.js';
import { Divider } from '../components/display/divider.js';
import { KeyHintBar } from '../components/display/key-hint.js';
import { SectionTitle } from '../components/display/titles.js';

export function HelpScreen() {
  const { navigate } = useAppContext();
  const { colors } = useTheme();

  useInput((input, key) => {
    if (key.escape || input === 'q') {
      navigate('home');
    }
  });

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold>
        {gradientLine('✦ Stargazer Help', { palette: 'stellar' })}
      </Text>

      <Divider variant="star" palette="stellar" />

      <Box flexDirection="column" marginTop={1}>
        <SectionTitle withStar>Keyboard Shortcuts</SectionTitle>
        <Box marginTop={1}>
          <KeyHintBar
            hints={[
              { keys: ['Ctrl', 'C'], label: 'Exit' },
              { keys: ['Q'], label: 'Quit' },
              { keys: ['ESC'], label: 'Back' },
              { keys: ['Enter'], label: 'Select' },
            ]}
          />
        </Box>
        <Box marginTop={1}>
          <KeyHintBar
            hints={[
              { keys: ['↑', '↓'], label: 'Navigate' },
            ]}
          />
        </Box>
      </Box>

      <Divider variant="dots" />

      <Box flexDirection="column" marginTop={1}>
        <SectionTitle withStar>Menu Options</SectionTitle>
        <Box flexDirection="column" marginTop={1} paddingLeft={2}>
          <Text>✦ <Text color={colors.text.primary}>Review staged</Text>      <Text dimColor>Analyze staged git changes</Text></Text>
          <Text>✦ <Text color={colors.text.primary}>Review unstaged</Text>    <Text dimColor>Analyze unstaged git changes</Text></Text>
          <Text>✧ <Text color={colors.text.primary}>Discover</Text>           <Text dimColor>Discover project conventions</Text></Text>
          <Text>◇ <Text color={colors.text.primary}>Browse history</Text>     <Text dimColor>View previous sessions</Text></Text>
          <Text>◈ <Text color={colors.text.primary}>Settings</Text>           <Text dimColor>Configure API key</Text></Text>
        </Box>
      </Box>

      <Box marginTop={2}>
        <KeyHintBar
          hints={[
            { keys: ['ESC'], label: 'Go back' },
            { keys: ['Q'], label: 'Go back' },
          ]}
        />
      </Box>
    </Box>
  );
}
