import React, { useState, useEffect } from 'react';
import {
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Collapse,
    CircularProgress
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import DescriptionIcon from '@mui/icons-material/Description';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import StorageIcon from '@mui/icons-material/Storage';
import { vaultService } from '../../services/vaultService';

interface SecretTreeProps {
    vaultId: number;
    onSelectSecret: (mount: string, path: string) => void;
}

interface TreeNode {
    name: string;
    path: string;
    type: 'mount' | 'folder' | 'secret';
    mountPoint: string;
    children?: TreeNode[];
    loaded?: boolean;
}

const SecretTree: React.FC<SecretTreeProps> = ({ vaultId, onSelectSecret }) => {
    // Force refresh check
    const [nodes, setNodes] = useState<TreeNode[]>([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {
        loadMounts();
    }, [vaultId]);

    const loadMounts = async () => {
        try {
            setLoading(true);
            const mounts = await vaultService.listMounts(vaultId);
            const mountNodes: TreeNode[] = Object.keys(mounts)
                .filter(k => mounts[k].type === 'kv' || mounts[k].type === 'kv-v2') // Only support KV for now
                .map(k => ({
                    name: k,
                    path: '',
                    type: 'mount',
                    mountPoint: k,
                    loaded: false
                }));
            setNodes(mountNodes);
        } catch (error) {
            console.error("Failed to list mounts", error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (node: TreeNode) => {
        const nodeId = `${node.mountPoint}${node.path}/${node.name}`;
        const isExpanded = expanded[nodeId];

        if (!isExpanded && !node.loaded && (node.type === 'mount' || node.type === 'folder')) {
            // Load children
            try {
                const currentPath = node.type === 'mount' ? '' : (node.path ? `${node.path}/${node.name}` : node.name);
                const result = await vaultService.listSecrets(vaultId, node.mountPoint, currentPath);
                const keys = result.data.keys;

                const children: TreeNode[] = keys.map((key: string) => {
                    const isFolder = key.endsWith('/');
                    const cleanName = isFolder ? key.slice(0, -1) : key;
                    return {
                        name: cleanName,
                        path: currentPath,
                        type: isFolder ? 'folder' : 'secret',
                        mountPoint: node.mountPoint,
                        loaded: false
                    };
                });

                // Update tree state
                setNodes(prev => updateNodeChildren(prev, nodeId, children));
            } catch (error) {
                console.error("Failed to list secrets", error);
            }
        }

        setExpanded(prev => ({ ...prev, [nodeId]: !isExpanded }));
    };

    const updateNodeChildren = (currentNodes: TreeNode[], targetId: string, children: TreeNode[]): TreeNode[] => {
        return currentNodes.map(node => {
            const nodeId = `${node.mountPoint}${node.path}/${node.name}`;
            if (nodeId === targetId || (node.type === 'mount' && node.mountPoint === targetId.slice(0, -1))) {
                // Correction for mount point IDs which are just "secret/" usually
                return { ...node, children, loaded: true };
            }
            // Basic recursion match - this logic needs to be robust for the tree structure
            // For MVPs, we might need a simpler ID generation strategy or flatten the structure slightly
            // Let's rely on reference update or exact path matching
            if (nodeId === targetId) return { ...node, children, loaded: true };

            if (node.children) {
                return { ...node, children: updateNodeChildren(node.children, targetId, children) };
            }
            return node;
        });
    };

    // Easier recursive render
    const renderTree = (nodes: TreeNode[]) => {
        return nodes.map((node) => {
            const nodeId = `${node.mountPoint}${node.path}/${node.name}`;
            return (
                <React.Fragment key={nodeId}>
                    <ListItem component="div" disablePadding>
                        <ListItemButton onClick={() => {
                            if (node.type === 'secret') {
                                const fullPath = node.path ? `${node.path}/${node.name}` : node.name;
                                onSelectSecret(node.mountPoint, fullPath);
                            } else {
                                handleToggle(node);
                            }
                        }}>
                            <ListItemIcon>
                                {node.type === 'mount' ? <StorageIcon /> :
                                    node.type === 'folder' ? <FolderIcon /> : <DescriptionIcon />}
                            </ListItemIcon>
                            <ListItemText primary={node.name} />
                            {(node.type === 'mount' || node.type === 'folder') ? (expanded[nodeId] ? <ExpandLess /> : <ExpandMore />) : null}
                        </ListItemButton>
                    </ListItem>

                    {node.children && (
                        <Collapse in={expanded[nodeId]} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding sx={{ pl: 2 }}>
                                {renderTree(node.children)}
                            </List>
                        </Collapse>
                    )}
                </React.Fragment>
            );
        });
    };

    return (
        <List component="nav">
            {loading ? <CircularProgress size={24} sx={{ m: 2 }} /> : renderTree(nodes)}
        </List>
    );
};

export default SecretTree;
