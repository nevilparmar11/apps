import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import { useAuthContext } from '../contexts/AuthContext';
import {
  InviteIcon,
  UserIcon,
  DevCardIcon,
  SettingsIcon,
  ReputationLightningIcon,
  ExitIcon,
  PlayIcon,
  PauseIcon,
  EditIcon,
  DevPlusIcon,
  PrivacyIcon,
} from './icons';
import InteractivePopup, {
  InteractivePopupPosition,
} from './tooltips/InteractivePopup';
import type { AllowedTags, ButtonProps } from './buttons/Button';
import { Button, ButtonSize, ButtonVariant } from './buttons/Button';
import {
  managePlusUrl,
  plusUrl,
  reputation,
  webappUrl,
} from '../lib/constants';
import { UserMetadata } from './profile/UserMetadata';
import { HeroImage } from './profile/HeroImage';
import { anchorDefaultRel } from '../lib/strings';
import { LogoutReason } from '../lib/user';
import { useLazyModal } from '../hooks/useLazyModal';
import { checkIsExtension, isIOSNative } from '../lib/func';
import { useDndContext } from '../contexts/DndContext';
import { LazyModal } from './modals/common/types';
import { usePlusSubscription } from '../hooks/usePlusSubscription';
import { LogEvent, TargetId } from '../lib/log';
import { featurePlusCtaCopy } from '../lib/featureManagement';
import { GiftIcon } from './icons/gift';
import { useConditionalFeature } from '../hooks';

interface ListItem {
  title: string;
  buttonProps?: ButtonProps<AllowedTags>;
  rightEmoji?: string;
}

interface ProfileMenuProps {
  onClose: () => void;
}

export default function ProfileMenu({
  onClose,
}: ProfileMenuProps): ReactElement {
  const { openModal } = useLazyModal();
  const { user, logout, isValidRegion: isPlusAvailable } = useAuthContext();
  const { isActive: isDndActive, setShowDnd } = useDndContext();
  const { isPlus, logSubscriptionEvent } = usePlusSubscription();
  const {
    value: { full: plusCta },
  } = useConditionalFeature({
    feature: featurePlusCtaCopy,
    shouldEvaluate: !isPlus,
  });

  const items: ListItem[] = useMemo(() => {
    const list: ListItem[] = [
      {
        title: 'Profile',
        buttonProps: {
          tag: 'a',
          href: user.permalink,
          icon: <UserIcon />,
        },
      },
    ];

    if (!isIOSNative()) {
      list.push({
        title: isPlus ? 'Manage plus' : plusCta,
        buttonProps: {
          tag: 'a',
          icon: <DevPlusIcon />,
          href: isPlus ? managePlusUrl : plusUrl,
          className: isPlus ? undefined : 'text-action-plus-default',
          target: isPlus ? '_blank' : undefined,
          onClick: () => {
            logSubscriptionEvent({
              event_name: isPlus
                ? LogEvent.ManageSubscription
                : LogEvent.UpgradeSubscription,
              target_id: TargetId.ProfileDropdown,
            });
          },
        },
      });
    }

    list.push(
      {
        title: 'Account details',
        buttonProps: {
          tag: 'a',
          icon: <EditIcon />,
          href: `${webappUrl}account/profile`,
        },
      },
      {
        title: 'Reputation',
        buttonProps: {
          tag: 'a',
          icon: <ReputationLightningIcon />,
          href: reputation,
          target: '_blank',
          rel: anchorDefaultRel,
        },
      },
      {
        title: 'Devcard',
        buttonProps: {
          tag: 'a',
          icon: <DevCardIcon />,
          href: `${webappUrl}devcard`,
        },
      },
      {
        title: 'Invite friends',
        buttonProps: {
          tag: 'a',
          icon: <InviteIcon />,
          href: `${webappUrl}account/invite`,
        },
      },
    );

    if (checkIsExtension()) {
      const DndIcon = isDndActive ? PlayIcon : PauseIcon;
      list.push({
        title: 'Pause new tab',
        buttonProps: {
          icon: <DndIcon />,
          onClick: () => setShowDnd(true),
        },
      });
    }

    list.push(
      {
        title: 'Customize',
        buttonProps: {
          icon: <SettingsIcon />,
          onClick: () => openModal({ type: LazyModal.UserSettings }),
        },
      },
      {
        title: 'Privacy',
        buttonProps: {
          tag: 'a',
          icon: <PrivacyIcon />,
          href: `${webappUrl}account/privacy`,
        },
      },
    );

    if (isPlusAvailable) {
      list.push({
        title: 'Gift daily.dev Plus',
        buttonProps: {
          icon: <GiftIcon />,
          onClick: () => {
            logSubscriptionEvent({
              event_name: LogEvent.GiftSubscription,
              target_id: TargetId.ProfileDropdown,
            });
            openModal({ type: LazyModal.GiftPlus });
          },
        },
      });
    }

    list.push({
      title: 'Logout',
      buttonProps: {
        icon: <ExitIcon />,
        onClick: () => logout(LogoutReason.ManualLogout),
      },
    });

    return list.filter(Boolean);
  }, [
    user.permalink,
    isPlusAvailable,
    isPlus,
    logSubscriptionEvent,
    isDndActive,
    setShowDnd,
    openModal,
    logout,
    plusCta,
  ]);

  if (!user) {
    return <></>;
  }

  return (
    <InteractivePopup
      onClose={onClose}
      closeOutsideClick
      position={InteractivePopupPosition.ProfileMenu}
      className="w-full max-w-64 !rounded-24 border border-border-subtlest-tertiary !bg-accent-pepper-subtlest"
      closeButton={{
        variant: ButtonVariant.Primary,
        size: ButtonSize.XSmall,
        position: 'right-3 top-3',
      }}
    >
      <HeroImage
        cover={user.cover}
        image={user.image}
        username={user.username}
        id={user.id}
        className={{
          cover: '!rounded-24 border-4 border-background-default',
          profile: '!rounded-24',
        }}
      />
      <UserMetadata
        username={user.username}
        name={user.name}
        createdAt={user.createdAt}
        reputation={user.reputation}
        isPlus={isPlus}
        className="gap-2 p-4"
      />
      <div className="flex flex-col border-t border-border-subtlest-tertiary py-2">
        {items.map(({ title, buttonProps, rightEmoji }) => (
          <Button
            key={title}
            {...buttonProps}
            className={classNames(
              'btn-tertiary w-full !justify-start !px-5 font-normal',
              buttonProps?.className,
            )}
          >
            {title}

            {rightEmoji && <span className="ml-auto">{rightEmoji}</span>}
          </Button>
        ))}
      </div>
    </InteractivePopup>
  );
}
