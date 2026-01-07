import { Box, Text, useInput } from 'ink';
import { useAppContext } from '../state/app-context.js';

export function HelpScreen() {
  const { navigate } = useAppContext();

  useInput((input, key) => {
    if (key.escape || input === 'q') {
      navigate('home');
    }
  });

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="cyan">Stargazer Help</Text>

      <Box flexDirection="column" marginTop={1}>
        <Text bold>Keyboard Shortcuts:</Text>
        <Text>  Ctrl+C    Exit application</Text>
        <Text>  Q         Exit from home screen</Text>
        <Text>  ESC       Go back / Cancel</Text>
        <Text>  Enter     Select / Submit</Text>
        <Text>  Arrow Keys Navigate lists</Text>
      </Box>

      <Box flexDirection="column" marginTop={1}>
        <Text bold>Menu Options:</Text>
        <Text>  Review staged      Analyze staged git changes</Text>
        <Text>  Review unstaged    Analyze unstaged git changes</Text>
        <Text>  Discover           Discover project conventions</Text>
        <Text>  Browse history     View previous sessions</Text>
        <Text>  Settings           Configure API key</Text>
      </Box>

      <Box marginTop={2}>
        <Text dimColor>Press ESC or Q to go back</Text>
      </Box>
    </Box>
  );
}
