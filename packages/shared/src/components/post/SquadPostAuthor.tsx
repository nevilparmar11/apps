import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { ProfileTooltip } from '../profile/ProfileTooltip';
import {
  getProfilePictureClasses,
  ProfileImageSize,
  ProfilePicture,
} from '../ProfilePicture';
import SquadMemberBadge from '../squads/SquadMemberBadge';
import type { Author } from '../../graphql/comments';
import type { SourceMemberRole } from '../../graphql/sources';
import { Separator } from '../cards/common/common';
import { ReputationUserBadge } from '../ReputationUserBadge';
import { TruncateText, DateFormat } from '../utilities';
import { TimeFormatType } from '../../lib/dateFormat';
import { ElementPlaceholder } from '../ElementPlaceholder';
import { VerifiedCompanyUserBadge } from '../VerifiedCompanyUserBadge';
import { TopReaderIn } from '../TopReaderIn';
import { PlusUserBadge } from '../PlusUserBadge';

interface SquadPostAuthorProps {
  className?: Partial<{
    container: string;
    name: string;
    handle: string;
    details: string;
  }>;
  author: Author;
  role?: SourceMemberRole;
  size?: ProfileImageSize;
  date?: string;
}

const SquadPostAuthorSkeleton = ({
  size,
  className,
}: Pick<SquadPostAuthorProps, 'className' | 'size'>) => {
  return (
    <span
      className={classNames('flex flex-row items-center', className?.container)}
    >
      <ElementPlaceholder className={getProfilePictureClasses(size)} />
      <div className="ml-4 flex flex-1 flex-col gap-1">
        <ElementPlaceholder className="h-6 w-20 rounded-10" />
        <ElementPlaceholder className="h-6 w-28 rounded-10" />
      </div>
    </span>
  );
};

function SquadPostAuthor({
  className,
  author,
  role,
  size = ProfileImageSize.XXXLarge,
  date,
}: SquadPostAuthorProps): ReactElement {
  if (!author) {
    return <SquadPostAuthorSkeleton className={className} size={size} />;
  }

  return (
    <span
      className={classNames('flex flex-row items-center', className?.container)}
    >
      <ProfileTooltip userId={author.id} link={{ href: author.permalink }}>
        <ProfilePicture
          user={author}
          size={size}
          nativeLazyLoading
          eager
          fetchPriority="high"
        />
      </ProfileTooltip>
      <ProfileTooltip userId={author.id} link={{ href: author.permalink }}>
        <a
          href={author.permalink}
          className={classNames(
            'ml-4 flex shrink flex-col overflow-hidden',
            className?.details,
          )}
        >
          <div className="flex w-full">
            <TruncateText
              className={classNames('font-bold', className?.name)}
              title={author.name}
            >
              {author.name}
            </TruncateText>
            <div className="flex gap-1">
              {author?.isPlus && <PlusUserBadge user={author} />}
              {author?.companies?.length > 0 && (
                <VerifiedCompanyUserBadge user={author} />
              )}
              <ReputationUserBadge user={author} />
              {!!role && (
                <SquadMemberBadge
                  key="squadMemberRole"
                  role={role}
                  removeMargins
                />
              )}
            </div>
          </div>
          <div
            className={classNames('flex text-text-tertiary', className?.handle)}
          >
            <TruncateText title={`@${author.username}`}>
              @{author.username}
            </TruncateText>
            {!!date && <Separator />}
            {!!date && <DateFormat date={date} type={TimeFormatType.Post} />}
            {author?.topReader && (
              <>
                <Separator />
                <TopReaderIn topReader={author.topReader} />
              </>
            )}
          </div>
        </a>
      </ProfileTooltip>
    </span>
  );
}

export default SquadPostAuthor;
