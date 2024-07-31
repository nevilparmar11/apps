import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { useSummaryActivation } from '../../hooks/experiments';
import { Loader } from '../Loader';
import { MagicIcon } from '../icons';
import { ButtonIconPosition, ButtonVariant } from '../buttons/common';
import { Button, ButtonColor } from '../buttons/Button';
import { useIsLightTheme } from '../../hooks/utils';

interface PostSummaryButtonProps {
  summary?: string;
}

export function PostSummaryButton({
  summary,
}: PostSummaryButtonProps): ReactElement {
  const isLight = useIsLightTheme();
  const { shouldShowOverlay, isLoading, onClickSummary } = useSummaryActivation(
    { summary },
  );

  if (!shouldShowOverlay) {
    return null;
  }

  return (
    <>
      <div
        className={classNames(
          'absolute inset-0 bg-gradient-to-t from-background-default from-60%',
          isLight ? 'to-overlay-primary-white' : 'to-overlay-primary-pepper',
        )}
      />
      <Button
        icon={isLoading ? <Loader /> : <MagicIcon secondary />}
        iconPosition={ButtonIconPosition.Right}
        variant={ButtonVariant.Primary}
        color={ButtonColor.Cabbage}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        onClick={onClickSummary}
        disabled={isLoading}
      >
        Auto-summarize
      </Button>
    </>
  );
}
