import { Box, Text } from 'ink';

interface HeaderProps {
  projectName: string;
}

export function Header({ projectName }: HeaderProps) {
  return (
    <Box
      flexDirection="row"
      justifyContent="space-between"
      paddingX={1}
      borderStyle="single"
      borderBottom
    >
      <Text bold color="cyan">
        Stargazer
      </Text>
      <Text dimColor>
        {projectName}
      </Text>
    </Box>
  );
}
