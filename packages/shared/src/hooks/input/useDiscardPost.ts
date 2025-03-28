import type { MutableRefObject } from 'react';
import { useCallback, useRef } from 'react';
import { del as deleteCache } from 'idb-keyval';
import { formToJson } from '../../lib/form';
import type { EditPostProps } from '../../graphql/posts';
import {
  checkSavedProperty,
  generateWritePostKey,
} from '../../components/post/freeform';
import type { UseExitConfirmation } from '../useExitConfirmation';
import { useExitConfirmation } from '../useExitConfirmation';
import usePersistentContext from '../usePersistentContext';
import type {
  MergedWriteObject,
  WriteForm,
  WritePostProps,
} from '../../contexts';

interface UseDiscardPostProps {
  post?: MergedWriteObject;
  draftIdentifier?: string;
}

interface UseDiscardPost
  extends UseExitConfirmation,
    Pick<WritePostProps, 'draft' | 'updateDraft'> {
  formRef: MutableRefObject<HTMLFormElement>;
  isDraftReady: boolean;
  clearDraft: () => void;
  isUpdatingDraft: boolean;
}

export const useDiscardPost = ({
  post,
  draftIdentifier,
}: UseDiscardPostProps = {}): UseDiscardPost => {
  const formRef = useRef<HTMLFormElement>();
  const draftKey = generateWritePostKey(draftIdentifier ?? post?.id);
  const [draft, updateDraft, isDraftReady, isUpdatingDraft] =
    usePersistentContext<Partial<WriteForm>>(draftKey, {});
  const onValidateAction = useCallback(() => {
    if (!formRef.current) {
      return true;
    }

    const form = formToJson<EditPostProps>(formRef.current);
    const isTitleSaved = checkSavedProperty('title', form, draft, post);
    const isContentSaved = checkSavedProperty('content', form, draft, post);
    return isTitleSaved && isContentSaved;
  }, [post, draft]);

  const { onAskConfirmation } = useExitConfirmation({ onValidateAction });

  const clearDraft = useCallback(async () => {
    await updateDraft({});
    await deleteCache(draftKey);
    await deleteCache(generateWritePostKey());
  }, [updateDraft, draftKey]);

  return {
    onAskConfirmation,
    draft,
    updateDraft,
    isDraftReady,
    formRef,
    clearDraft,
    isUpdatingDraft,
  };
};
