import orderBy from 'lodash-es/orderBy'
import path from 'path'
import { DateTime } from 'luxon'
import { DavPermission, DavProperty } from '../../../web-pkg/src/constants'
import {
  LinkShareRoles,
  PeopleShareRoles,
  SharePermissions,
  Share,
  ShareStatus,
  ShareTypes,
  spaceRoleEditor,
  spaceRoleManager,
  spaceRoleViewer
} from '../../../web-client/src/helpers/share'
import { extractExtensionFromFile, extractStorageId } from './resource'
import { buildWebDavSpacesPath, extractDomSelector } from '../../../web-client/src/helpers/resource'
import { Resource } from '../../../web-client'

export function renameResource(resource, newName, newPath) {
  let resourcePath = '/' + newPath + newName
  if (resourcePath.startsWith('/files') || resourcePath.startsWith('/space')) {
    resourcePath = resourcePath.split('/').splice(3).join('/')
  }

  resource.name = newName
  resource.path = '/' + resourcePath
  resource.webDavPath = '/' + newPath + newName
  resource.extension = extractExtensionFromFile(resource)

  return resource
}

export function buildResource(resource): Resource {
  const name = resource.fileInfo[DavProperty.Name] || path.basename(resource.name)
  const isFolder = resource.type === 'dir' || resource.type === 'folder'
  const extension = extractExtensionFromFile({ ...resource, name })
  let resourcePath

  if (resource.name.startsWith('/files') || resource.name.startsWith('/space')) {
    resourcePath = resource.name.split('/').slice(3).join('/')
  } else {
    resourcePath = resource.name
  }

  if (!resourcePath.startsWith('/')) {
    resourcePath = `/${resourcePath}`
  }

  const id = resource.fileInfo[DavProperty.FileId]

  return {
    id,
    fileId: resource.fileInfo[DavProperty.FileId],
    storageId: extractStorageId(resource.fileInfo[DavProperty.FileId]),
    mimeType: resource.fileInfo[DavProperty.MimeType],
    name,
    extension: isFolder ? '' : extension,
    path: resourcePath,
    webDavPath: resource.name,
    type: isFolder ? 'folder' : resource.type,
    isFolder,
    mdate: resource.fileInfo[DavProperty.LastModifiedDate],
    size: isFolder
      ? resource.fileInfo[DavProperty.ContentSize]
      : resource.fileInfo[DavProperty.ContentLength],
    indicators: [],
    permissions: (resource.fileInfo[DavProperty.Permissions] as string) || '',
    starred: resource.fileInfo[DavProperty.IsFavorite] !== '0',
    etag: resource.fileInfo[DavProperty.ETag],
    sharePermissions: resource.fileInfo[DavProperty.SharePermissions],
    shareTypes: (function () {
      if (resource.fileInfo[DavProperty.ShareTypes]) {
        return resource.fileInfo[DavProperty.ShareTypes].map((v) => parseInt(v))
      }
      return []
    })(),
    privateLink: resource.fileInfo[DavProperty.PrivateLink],
    downloadURL: resource.fileInfo[DavProperty.DownloadURL],
    shareId: resource.fileInfo[DavProperty.ShareId],
    shareRoot: resource.fileInfo[DavProperty.ShareRoot],
    ownerId: resource.fileInfo[DavProperty.OwnerId],
    ownerDisplayName: resource.fileInfo[DavProperty.OwnerDisplayName],
    canUpload: function () {
      return this.permissions.indexOf(DavPermission.FolderCreateable) >= 0
    },
    canDownload: function () {
      return true
    },
    canBeDeleted: function () {
      return this.permissions.indexOf(DavPermission.Deletable) >= 0
    },
    canRename: function () {
      return this.permissions.indexOf(DavPermission.Renameable) >= 0
    },
    canShare: function () {
      return this.permissions.indexOf(DavPermission.Shareable) >= 0
    },
    canCreate: function () {
      return this.permissions.indexOf(DavPermission.FolderCreateable) >= 0
    },
    isMounted: function () {
      return this.permissions.indexOf(DavPermission.Mounted) >= 0
    },
    isReceivedShare: function () {
      return this.permissions.indexOf(DavPermission.Shared) >= 0
    },
    canDeny: function () {
      return this.permissions.indexOf(DavPermission.Deny) >= 0
    },
    getDomSelector: () => extractDomSelector(id)
  }
}

export function buildWebDavFilesPath(userId, path) {
  return '/' + `files/${userId}/${path}`.split('/').filter(Boolean).join('/')
}

export function buildWebDavFilesTrashPath(userId, path = '') {
  return '/' + `trash-bin/${userId}/${path}`.split('/').filter(Boolean).join('/')
}

export function buildWebDavSpacesTrashPath(storageId, path = '') {
  return '/' + `/spaces/trash-bin/${storageId}/${path}`.split('/').filter(Boolean).join('/')
}

function addSharedWithToShares(shares) {
  const resources = []
  let previousShare = null
  for (const share of shares) {
    if (
      previousShare?.storage_id === share.storage_id &&
      previousShare?.file_source === share.file_source
    ) {
      if (ShareTypes.containsAnyValue(ShareTypes.authenticated, [parseInt(share.share_type)])) {
        previousShare.sharedWith.push({
          username: share.share_with,
          name: share.share_with_displayname,
          displayName: share.share_with_displayname,
          avatar: undefined,
          shareType: parseInt(share.share_type)
        })
      } else if (parseInt(share.share_type) === ShareTypes.link.value) {
        previousShare.sharedWith.push({
          name: share.name || share.token,
          link: true,
          shareType: parseInt(share.share_type)
        })
      }

      continue
    }

    if (ShareTypes.containsAnyValue(ShareTypes.authenticated, [parseInt(share.share_type)])) {
      share.sharedWith = [
        {
          username: share.share_with,
          displayName: share.share_with_displayname,
          name: share.share_with_displayname,
          avatar: undefined,
          shareType: parseInt(share.share_type)
        }
      ]
    } else if (parseInt(share.share_type) === ShareTypes.link.value) {
      share.sharedWith = [
        {
          name: share.name || share.token,
          link: true,
          shareType: parseInt(share.share_type)
        }
      ]
    }

    previousShare = share
    resources.push(share)
  }
  return resources
}


export function buildShare(s, file, allowSharePermission): Share {
  if (parseInt(s.share_type) === ShareTypes.link.value) {
    return _buildLink(s)
  }
  if (parseInt(s.share_type) === ShareTypes.space.value) {
    return buildSpaceShare(s, file)
  }

  return buildCollaboratorShare(s, file, allowSharePermission)
}

export function buildSpaceShare(s, storageId): Share {
  let permissions, role

  switch (s.role) {
    case spaceRoleManager.name:
      permissions = spaceRoleManager.bitmask(true)
      role = spaceRoleManager
      break
    case spaceRoleEditor.name:
      permissions = spaceRoleEditor.bitmask(true)
      role = spaceRoleEditor
      break
    case spaceRoleViewer.name:
      permissions = spaceRoleViewer.bitmask(true)
      role = spaceRoleViewer
      break
  }

  return {
    shareType: ShareTypes.space.value,
    id: storageId,
    collaborator: {
      name: s.onPremisesSamAccountName,
      displayName: s.displayName,
      additionalInfo: null
    },
    permissions,
    role
  }
}

function _buildLink(link): Share {
  let description = ''

  const role = LinkShareRoles.getByBitmask(parseInt(link.permissions), link.item_type === 'folder')
  if (role) {
    description = role.label
  }

  const quicklinkOc10 = ((): boolean => {
    if (typeof link.attributes !== 'string') {
      return false
    }

    return (
      JSON.parse(link.attributes || '[]').find((attr) => attr.key === 'isQuickLink')?.enabled ===
      'true'
    )
  })()
  const quicklinkOcis = link.quicklink === 'true'
  const quicklink = quicklinkOc10 || quicklinkOcis

  return {
    shareType: parseInt(link.share_type),
    id: link.id,
    token: link.token as string,
    url: link.url,
    path: link.path,
    permissions: link.permissions,
    description,
    quicklink,
    stime: link.stime,
    name: typeof link.name === 'string' ? link.name : (link.token as string),
    password: !!(link.share_with && link.share_with_displayname),
    expiration:
      typeof link.expiration === 'string'
        ? DateTime.fromFormat(link.expiration, 'yyyy-MM-dd HH:mm:ss').toFormat('yyyy-MM-dd')
        : null,
    itemSource: link.item_source,
    file: {
      parent: link.file_parent,
      source: link.file_source,
      target: link.file_target
    }
  }
}

function _fixAdditionalInfo(data) {
  if (typeof data !== 'string') {
    return null
  }
  return data
}

export function buildCollaboratorShare(s, file, allowSharePermission): Share {
  const share: Share = {
    shareType: parseInt(s.share_type),
    id: s.id
  }
  if (
    ShareTypes.containsAnyValue(
      [ShareTypes.user, ShareTypes.remote, ShareTypes.group, ShareTypes.guest],
      [share.shareType]
    )
  ) {
    // FIXME: SDK is returning empty object for additional info when empty
    share.collaborator = {
      name: s.share_with,
      displayName: s.share_with_displayname,
      additionalInfo: _fixAdditionalInfo(s.share_with_additional_info)
    }
    share.owner = {
      name: s.uid_owner,
      displayName: s.displayname_owner,
      additionalInfo: _fixAdditionalInfo(s.additional_info_owner)
    }
    share.fileOwner = {
      name: s.uid_file_owner,
      displayName: s.displayname_file_owner,
      additionalInfo: _fixAdditionalInfo(s.additional_info_file_owner)
    }
    share.stime = s.stime
    share.permissions = parseInt(s.permissions)
    share.customPermissions = SharePermissions.bitmaskToPermissions(s.permissions)
    share.role = PeopleShareRoles.getByBitmask(
      parseInt(s.permissions),
      file.isFolder || file.type === 'folder',
      allowSharePermission
    )
    // share.email = 'foo@djungle.com' // hm, where do we get the mail from? share_with_additional_info:Object?
  }

  // expiration:Object if unset, or string "2019-04-24 00:00:00"
  if (typeof s.expiration === 'string' || s.expiration instanceof String) {
    share.expires = new Date(s.expiration)
  }
  share.path = s.path

  return share
}

export function buildDeletedResource(resource): Resource {
  const isFolder = resource.type === 'dir' || resource.type === 'folder'
  const fullName = resource.fileInfo[DavProperty.TrashbinOriginalFilename]
  const extension = extractExtensionFromFile({ name: fullName, type: resource.type } as Resource)
  const id = path.basename(resource.name)
  return {
    type: isFolder ? 'folder' : resource.type,
    isFolder,
    ddate: resource.fileInfo[DavProperty.TrashbinDeletedDate],
    name: path.basename(fullName),
    extension,
    path: resource.fileInfo[DavProperty.TrashbinOriginalLocation],
    id,
    indicators: [],
    canUpload: () => false,
    canDownload: () => false,
    canBeDeleted: () => {
      /** FIXME: once https://github.com/owncloud/ocis/issues/3339 gets implemented,
       * we want to add a check if the permission is set.
       * We might to be careful and do an early return true if DavProperty.Permissions is not set
       * as oc10 does not support it.
       **/
      return true
    },
    canBeRestored: function () {
      /** FIXME: once https://github.com/owncloud/ocis/issues/3339 gets implemented,
       * we want to add a check if the permission is set.
       * We might to be careful and do an early return true if DavProperty.Permissions is not set
       * as oc10 does not support it.
       **/
      return true
    },
    canRename: () => false,
    canShare: () => false,
    canCreate: () => false,
    isMounted: () => false,
    isReceivedShare: () => false,
    getDomSelector: () => extractDomSelector(id)
  }
}
